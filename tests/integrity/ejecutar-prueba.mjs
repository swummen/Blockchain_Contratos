#!/usr/bin/env node
// Prueba de integridad por mutación documental (OE4, RNF-14: 100 % de detección).
// Por cada uno de los 20 documentos de docs/documentos-prueba/:
//   1. Empleado registra el original (hash en el ledger).
//   2. Verificador lo verifica con el original: debe dar Verificado (control de
//      falsos positivos; sin él, un sistema que dijera "Alterado" a todo pasaría).
//   3. Verificador lo verifica con el alterado: debe dar Alterado.
//   4. La trazabilidad del ledger debe tener esas 3 acciones.
// Solo usa la API, como el navegador: no cambia nada del servidor.
//
// Uso (desde la raíz del repo):
//   node tests/integrity/ejecutar-prueba.mjs --api https://<dominio>/api
//   node tests/integrity/ejecutar-prueba.mjs                     (local, http://localhost:5173/api)
//   node tests/integrity/ejecutar-prueba.mjs --otp-desde-logs    (local con SMTP vacío)
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { createInterface } from "node:readline/promises";

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const API = (opt("api") ?? "http://localhost:5173/api").replace(/\/$/, "");
const OTP_FROM_LOGS = args.includes("--otp-desde-logs");
const DOCS = "docs/documentos-prueba";
const manifest = JSON.parse(readFileSync(join(DOCS, "manifiesto.json"), "utf8"));

// Iterador de líneas y no rl.question: con la entrada redirigida, question()
// pierde las líneas que llegan antes de preguntar.
const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: process.stdin.isTTY });
const lines = rl[Symbol.asyncIterator]();
let muted = false;
rl._writeToOutput = (s) => { if (!muted) process.stdout.write(s); };
async function readLine(prompt, hidden = false) {
  process.stdout.write(prompt);
  muted = hidden;
  const { value } = await lines.next();
  muted = false;
  if (hidden || !process.stdin.isTTY) process.stdout.write("\n");
  return (value ?? "").trim();
}
const ask = async (question, fallback) =>
  (await readLine(fallback ? `${question} [${fallback}]: ` : `${question}: `)) || fallback;
// La contraseña no se muestra en pantalla mientras se escribe.
const askHidden = (question) => readLine(question, true);

async function call(method, path, { token, json, form } = {}) {
  const t0 = performance.now();
  const res = await fetch(API + path, {
    method,
    headers: { ...(token && { Authorization: `Bearer ${token}` }), ...(json && { "Content-Type": "application/json" }) },
    body: json ? JSON.stringify(json) : form,
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body, ms: performance.now() - t0 };
}

function otpFromLogs(email) {
  // 2>&1: docker logs repite la salida de error del contenedor por su propia salida de error.
  const logs = execSync("docker logs backend 2>&1", { encoding: "utf8" });
  const lines = logs.split("\n").filter((l) => l.includes(`código OTP para ${email}:`));
  return lines.at(-1)?.split(": ").at(-1).trim();
}

async function signIn(role, defaultEmail) {
  console.log(`\nSesión de ${role}`);
  const email = await ask("  Correo", defaultEmail);
  const password = await askHidden("  Contraseña: ");
  const login = await call("POST", "/auth/login", { json: { email, password } });
  if (login.status !== 200) throw new Error(`No se pudo iniciar sesión como ${role} (${login.status}): ${login.body.message}`);
  let code;
  if (OTP_FROM_LOGS) {
    await new Promise((r) => setTimeout(r, 1500));
    code = otpFromLogs(email);
  } else {
    code = await ask(`  Código que llegó al correo de ${email}`);
  }
  const otp = await call("POST", "/auth/verify-otp", { json: { email, code } });
  if (otp.status !== 200) throw new Error(`Código rechazado (${otp.status}): ${otp.body.message}`);
  return otp.body.token;
}

const pdfForm = (path) => {
  const form = new FormData();
  form.append("document", new Blob([readFileSync(join(DOCS, path))], { type: "application/pdf" }), basename(path));
  return form;
};

console.log(`Prueba de integridad por mutación documental contra ${API}`);
const employee = await signIn("Empleado", "contratosblockchain+empleado@gmail.com");
const verifier = await signIn("Verificador", "contratosblockchain+verificador@gmail.com");
rl.close();
console.log("");

const rows = [];
for (const doc of manifest) {
  const row = { codigo: doc.codigo, tipo: doc.tipo, alteracion: doc.alteracion, detalle: doc.detalle };
  try {
    const reg = await call("POST", "/documents", { token: employee, form: pdfForm(doc.original) });
    if (reg.status !== 201) throw new Error(`registro HTTP ${reg.status}: ${reg.body.message}`);
    row.documentId = reg.body.documentId;
    row.msRegistro = reg.ms;

    const vo = await call("POST", `/documents/${row.documentId}/verifications`, { token: verifier, form: pdfForm(doc.original) });
    const va = await call("POST", `/documents/${row.documentId}/verifications`, { token: verifier, form: pdfForm(doc.alterado) });
    if (vo.status !== 200 || va.status !== 200) throw new Error(`verificación HTTP ${vo.status}/${va.status}: ${vo.body.message ?? va.body.message}`);
    row.resultadoOriginal = vo.body.status;
    row.resultadoAlterado = va.body.status;
    row.msVerificacion = (vo.ms + va.ms) / 2;
    // El hash del ledger debe ser el del original generado, y el calculado del alterado, el suyo.
    row.hashesCoinciden = vo.body.registeredHash === doc.sha256Original && va.body.computedHash === doc.sha256Alterado;

    const ev = await call("GET", `/documents/${row.documentId}/events`, { token: verifier });
    const events = ev.status === 200 ? ev.body : [];
    row.txRegistro = events.find((e) => e.action === "registro")?.txId ?? "";
    const results = events.filter((e) => e.action === "verificacion").map((e) => e.result).sort();
    row.trazabilidadOk = !!row.txRegistro && results.join(",") === "comprometida,confirmada";

    row.detectada = row.resultadoAlterado === "Alterado";
    row.falsoPositivo = row.resultadoOriginal !== "Verificado";
    row.pass = row.detectada && !row.falsoPositivo && row.hashesCoinciden && row.trazabilidadOk;
  } catch (err) {
    row.error = err.message;
    row.pass = false;
  }
  rows.push(row);
  console.log(`  ${row.codigo}  ${row.alteracion.padEnd(9)}  original: ${(row.resultadoOriginal ?? "-").padEnd(10)}  alterado: ${(row.resultadoAlterado ?? "-").padEnd(9)}  ${row.pass ? "PASS" : "FALLA"}${row.error ? `  (${row.error})` : ""}`);
}

const detected = rows.filter((r) => r.detectada).length;
const falsePositives = rows.filter((r) => r.falsoPositivo).length;
const traced = rows.filter((r) => r.trazabilidadOk).length;
const passed = rows.filter((r) => r.pass).length;
const kpiOk = detected === manifest.length && falsePositives === 0;
const avg = (k) => { const v = rows.filter((r) => r[k]).map((r) => r[k]); return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(0) : "n/d"; };

const now = new Date();
const fecha = now.toLocaleString("es-CO", { timeZone: "America/Bogota" });
const stamp = new Date(now.getTime() - 5 * 3600_000).toISOString().slice(0, 16).replace(/[:T]/g, "-");
const entorno = /localhost|127\.0\.0\.1/.test(API) ? "Docker local" : "Servidor de validación (Azure)";

mkdirSync("tests/integrity/resultados", { recursive: true });
const csvHeader = "codigo,tipo,alteracion,documentId,resultado_original,resultado_alterado,detectada,falso_positivo,hashes_coinciden,trazabilidad_ok,tx_registro,ms_registro,ms_verificacion,pass,error";
const csv = rows.map((r) => [r.codigo, r.tipo, r.alteracion, r.documentId, r.resultadoOriginal, r.resultadoAlterado, r.detectada, r.falsoPositivo, r.hashesCoinciden, r.trazabilidadOk, r.txRegistro, r.msRegistro?.toFixed(0), r.msVerificacion?.toFixed(0), r.pass, r.error ? `"${r.error}"` : ""].join(","));
const csvPath = `tests/integrity/resultados/corrida-${stamp}.csv`;
writeFileSync(csvPath, [csvHeader, ...csv].join("\n") + "\n");

const byKind = [...new Set(manifest.map((m) => m.alteracion))].map((k) => {
  const g = rows.filter((r) => r.alteracion === k);
  return `| ${k} | ${g.length} | ${g.filter((r) => r.detectada).length} de ${g.length} |`;
});
const report = `# Prueba de integridad por mutación documental (OE4 · RNF-14)

| | |
|---|---|
| **Resultado del KPI** | **${kpiOk ? "CUMPLE" : "NO CUMPLE"}**: ${detected} de ${manifest.length} alteraciones detectadas (${((detected / manifest.length) * 100).toFixed(0)} %, meta 100 %) |
| Falsos positivos | ${falsePositives} de ${manifest.length} originales marcados como alterados (meta 0) |
| Trazabilidad en el ledger | ${traced} de ${manifest.length} documentos con registro y sus 2 verificaciones |
| Casos PASS | ${passed} de ${manifest.length} |
| Fecha | ${fecha} |
| Entorno | **${entorno}** (\`${API}\`) |
| Latencia media | registro ${avg("msRegistro")} ms · verificación ${avg("msVerificacion")} ms |
| Datos crudos | \`${csvPath}\` |

## Método

Conjunto de 20 documentos sintéticos con datos ficticios: 12 contratos laborales y
8 acuerdos de confidencialidad (\`docs/documentos-prueba/\`), cada uno con una copia
alterada. Por documento: el Empleado registra el original; el Verificador lo verifica
con el original (debe dar **Verificado**, control de falsos positivos) y con el
alterado (debe dar **Alterado**). Se comprueba además que los hashes devueltos por la
API sean los calculados al generar los archivos y que el ledger registre las 3 acciones.

## Detección por tipo de alteración

| Alteración | Documentos | Detectadas |
|---|---|---|
${byKind.join("\n")}

## Resultado por documento

| Código | Tipo | Alteración aplicada | Original | Alterado | TxID del registro | Resultado |
|---|---|---|---|---|---|---|
${rows.map((r) => `| ${r.codigo} | ${r.tipo} | ${r.detalle} | ${r.resultadoOriginal ?? "-"} | ${r.resultadoAlterado ?? "-"} | \`${(r.txRegistro || "-").slice(0, 16)}…\` | ${r.pass ? "PASS" : `FALLA${r.error ? `: ${r.error}` : ""}`} |`).join("\n")}
`;
mkdirSync("docs/evidencias", { recursive: true });
writeFileSync("docs/evidencias/integridad-mutacion.md", report);

console.log(`\nDetección: ${detected}/${manifest.length} · falsos positivos: ${falsePositives} · trazabilidad: ${traced}/${manifest.length} · PASS: ${passed}/${manifest.length}`);
console.log(`KPI RNF-14 (100 % de detección): ${kpiOk ? "CUMPLE" : "NO CUMPLE"}`);
console.log(`Informe: docs/evidencias/integridad-mutacion.md · datos: ${csvPath}`);
process.exit(kpiOk && passed === manifest.length ? 0 : 1);
