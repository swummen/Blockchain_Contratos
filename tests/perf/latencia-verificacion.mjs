#!/usr/bin/env node
// KPI OE3 / RNF-10: P95 de latencia de POST /documents/{id}/verifications ≤ 3000 ms en
// 50 peticiones consecutivas sobre Docker local. Sin dependencias: Node 20+ (fetch,
// FormData, Blob, performance.now). Ver tests/perf/README.md.
//
// Uso:
//   node tests/perf/latencia-verificacion.mjs --document <documentId> --file <pdf> \
//        [--email contratosblockchain+verificador@gmail.com] [--n 50] [--base http://localhost:8080]
//        [--code <OTP>] [--out docs/evidencias]
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import os from "node:os";
import { createInterface } from "node:readline/promises";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith("--") ? [...acc, [a.slice(2), all[i + 1]]] : acc), []),
);
const BASE = args.base ?? "http://localhost:8080";
const N = Number(args.n ?? 50);
const EMAIL = args.email ?? "contratosblockchain+verificador@gmail.com";
const PASSWORD = args.password ?? "Contratos123!";
const OUT = args.out ?? "docs/evidencias";
const LIMIT_MS = 3000;

if (!args.document || !args.file) {
  console.error("Faltan --document <documentId> y --file <pdf>. Ver tests/perf/README.md.");
  process.exit(1);
}
const pdf = readFileSync(args.file);

async function post(path, body, token) {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { ...(token && { Authorization: `Bearer ${token}` }), ...(!(body instanceof FormData) && { "Content-Type": "application/json" }) },
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
  return { status: res.status, json: await res.json().catch(() => ({})) };
}

// --- Sesión del Verificador (login + código OTP) ---
const login = await post("/auth/login", { email: EMAIL, password: PASSWORD });
if (login.status !== 200) throw new Error(`Login falló (${login.status}): ${login.json.message}`);
let code = args.code;
if (!code) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  code = (await rl.question(`Código de verificación enviado a ${EMAIL}: `)).trim();
  rl.close();
}
const otp = await post("/auth/verify-otp", { email: EMAIL, code });
if (otp.status !== 200) throw new Error(`Código rechazado (${otp.status}): ${otp.json.message}`);
const token = otp.json.token;

async function verifyOnce() {
  const form = new FormData();
  form.append("document", new Blob([pdf], { type: "application/pdf" }), basename(args.file));
  const t0 = performance.now();
  const r = await post(`/documents/${args.document}/verifications`, form, token);
  return { ms: performance.now() - t0, status: r.status, result: r.json.status ?? r.json.message };
}

// Una petición de calentamiento (no se cuenta): la primera conexión TCP/TLS y el
// primer endoso del día no representan el uso normal.
const warm = await verifyOnce();
if (warm.status !== 200) throw new Error(`La verificación de calentamiento falló (${warm.status}): ${warm.result}`);

const rows = [];
for (let i = 1; i <= N; i++) {
  const r = await verifyOnce(); // consecutivas: la siguiente empieza cuando termina la anterior
  rows.push({ i, ...r });
  process.stdout.write(`  ${String(i).padStart(2)}/${N}  ${r.ms.toFixed(0).padStart(5)} ms  HTTP ${r.status}  ${r.result}\n`);
}

// --- Estadísticas (P95 por rango más cercano: el valor en la posición ceil(0.95·n)) ---
const ok = rows.filter((r) => r.status === 200);
const sorted = ok.map((r) => r.ms).sort((a, b) => a - b);
const pct = (p) => sorted[Math.max(0, Math.ceil((p / 100) * sorted.length) - 1)];
const mean = sorted.reduce((a, b) => a + b, 0) / sorted.length;
const p95 = pct(95);
const pass = ok.length === N && p95 <= LIMIT_MS;

// --- Entorno (para no mezclar Docker local con Azure, observación de OBJETIVO 3) ---
const sh = (c) => { try { return execSync(c, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { return "n/d"; } };
const now = new Date();
const stamp = new Date(now.getTime() - 5 * 3600_000).toISOString().slice(0, 16).replace(/[:T]/g, "-"); // hora de Colombia (UTC-5)
const env = {
  fecha: now.toLocaleString("es-CO", { timeZone: "America/Bogota" }),
  equipo: `${os.type()} ${os.release()} · ${os.cpus()[0]?.model.trim() ?? "CPU n/d"} (${os.cpus().length} hilos) · ${(os.totalmem() / 2 ** 30).toFixed(1)} GB RAM`,
  docker: sh("docker version --format {{.Server.Version}}"),
  contenedores: sh("docker ps --format \"{{.Names}} ({{.Image}})\"").split("\n").filter((l) => /^(peer0|orderer|backend|mongo)/.test(l)).join(", "),
  node: process.version,
};

mkdirSync(OUT, { recursive: true });
const csvPath = join(OUT, `latencia-verificacion-${stamp}.csv`);
writeFileSync(csvPath, "peticion,latencia_ms,http,resultado\n" + rows.map((r) => `${r.i},${r.ms.toFixed(1)},${r.status},${r.result}`).join("\n") + "\n");

const report = `# Medición de latencia: verificación de integridad (RNF-10)

| | |
|---|---|
| **Resultado** | **${pass ? "PASS" : "FALLA"}**: P95 = **${p95.toFixed(0)} ms** (meta ≤ ${LIMIT_MS} ms) |
| Fecha | ${env.fecha} |
| Entorno | **Docker local** (no Azure) |
| Equipo | ${env.equipo} |
| Docker / Node | ${env.docker} / ${env.node} |
| Contenedores | ${env.contenedores} |
| Endpoint | \`POST ${BASE}/documents/{id}/verifications\` (rol Verificador) |
| Documento | \`${args.document}\` · archivo \`${basename(args.file)}\` (${(pdf.length / 1024).toFixed(1)} KB) |

## Método

- Herramienta: \`tests/perf/latencia-verificacion.mjs\` (Node.js, \`fetch\` + \`performance.now()\`), sin dependencias externas.
- ${N} peticiones **consecutivas** (cada una empieza cuando termina la anterior), más 1 de calentamiento que no se cuenta.
- Se mide el tiempo completo visto por el cliente: subida del PDF, validación, SHA-256, consulta de la huella al ledger, transacción \`RecordVerification\` (endoso de Org1 y Org2, ordenamiento y confirmación del bloque) y actualización de MongoDB.
- P95 por el método del rango más cercano: valor en la posición ⌈0,95 · n⌉ de las mediciones ordenadas.
- Respuestas correctas: ${ok.length} de ${N}.

## Resultados

| Mínimo | Promedio | P50 | P90 | **P95** | P99 | Máximo |
|---|---|---|---|---|---|---|
| ${sorted[0].toFixed(0)} ms | ${mean.toFixed(0)} ms | ${pct(50).toFixed(0)} ms | ${pct(90).toFixed(0)} ms | **${p95.toFixed(0)} ms** | ${pct(99).toFixed(0)} ms | ${sorted.at(-1).toFixed(0)} ms |

## Las ${N} mediciones

| # | Latencia (ms) | HTTP | Resultado |
|---|---|---|---|
${rows.map((r) => `| ${r.i} | ${r.ms.toFixed(0)} | ${r.status} | ${r.result} |`).join("\n")}

Datos crudos: \`${basename(csvPath)}\`.
`;
const mdPath = join(OUT, `latencia-verificacion-${stamp}.md`);
writeFileSync(mdPath, report);

console.log(`\nP95 = ${p95.toFixed(0)} ms (meta ≤ ${LIMIT_MS} ms) → ${pass ? "PASS" : "FALLA"}`);
console.log(`Reporte: ${mdPath}\nDatos:   ${csvPath}`);
process.exit(pass ? 0 : 2);
