#!/usr/bin/env node
// Genera los 20 documentos sintéticos de la prueba de integridad (OE4, RNF-14):
// 12 contratos laborales y 8 acuerdos de confidencialidad, más una copia alterada
// de cada uno. Todos los datos son ficticios. Fechas internas fijas: volver a
// correrlo produce exactamente los mismos bytes (y los mismos hashes).
//
// Uso (desde la raíz del repo): node tests/integrity/generar-documentos.mjs
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "../../docs/documentos-prueba");
const CREATED = new Date("2026-10-01T09:00:00-05:00");
const TAMPERED_AT = new Date("2026-10-20T18:30:00-05:00");
const COMPANY = { name: "Comercializadora Ficticia del Valle S.A.S.", nit: "900.000.000-1", rep: "Andrés Felipe Prueba Gómez", city: "Cali" };

const EMPLOYEES = [
  ["Laura Camila Ruiz Ficticia", "1.000.000.101", "Analista de Talento Humano", 3200000, "3 de febrero de 2026"],
  ["Juan Sebastián Mora Ejemplo", "1.000.000.102", "Auxiliar Contable", 2100000, "10 de febrero de 2026"],
  ["Valentina Ortiz Simulada", "1.000.000.103", "Desarrolladora de Software", 5400000, "2 de marzo de 2026"],
  ["Carlos Andrés Peña Demo", "1.000.000.104", "Coordinador de Logística", 4100000, "16 de marzo de 2026"],
  ["Daniela Rojas Inventada", "1.000.000.105", "Asesora Comercial", 2500000, "1 de abril de 2026"],
  ["Miguel Ángel Torres Prueba", "1.000.000.106", "Técnico de Soporte", 2300000, "15 de abril de 2026"],
  ["Sara Lucía Gómez Ficticia", "1.000.000.107", "Abogada Laboralista", 4800000, "4 de mayo de 2026"],
  ["Felipe Castro Ejemplo", "1.000.000.108", "Jefe de Compras", 5000000, "18 de mayo de 2026"],
  ["Mariana Herrera Simulada", "1.000.000.109", "Diseñadora Gráfica", 2900000, "1 de junio de 2026"],
  ["Santiago López Demo", "1.000.000.110", "Operario de Bodega", 1750000, "16 de junio de 2026"],
  ["Isabella Vargas Inventada", "1.000.000.111", "Analista de Datos", 4500000, "1 de julio de 2026"],
  ["Tomás Ramírez Prueba", "1.000.000.112", "Auxiliar Administrativo", 1900000, "15 de julio de 2026"],
];
const NDA_PARTIES = [
  ["Natalia Moreno Ficticia", "1.000.000.201", "consultoría en procesos de nómina", "dos (2) años"],
  ["Esteban Quintero Ejemplo", "1.000.000.202", "auditoría de sistemas de información", "tres (3) años"],
  ["Paula Andrea Ríos Simulada", "1.000.000.203", "desarrollo de un módulo de facturación", "dos (2) años"],
  ["Diego Alejandro Cruz Demo", "1.000.000.204", "revisión de contratos con proveedores", "un (1) año"],
  ["Camila Fernández Inventada", "1.000.000.205", "migración de la base de datos de clientes", "tres (3) años"],
  ["Andrés Salazar Prueba", "1.000.000.206", "asesoría tributaria", "dos (2) años"],
  ["Juliana Pardo Ficticia", "1.000.000.207", "capacitación del área comercial", "un (1) año"],
  ["Ricardo Mejía Ejemplo", "1.000.000.208", "evaluación de seguridad de la red interna", "cinco (5) años"],
];

const money = (n) => "$" + n.toLocaleString("es-CO").replace(/,/g, ".");

// Una alteración por documento, repartidas por igual: 4 de cada tipo.
const TAMPERINGS = ["texto", "firma", "metadatos", "caracter", "anexo"];
const TAMPER_LABEL = {
  texto: "Texto: se cambió una condición del documento",
  firma: "Firma: se reemplazó el nombre de quien firma",
  metadatos: "Metadatos: autor y fecha de modificación (contenido visible idéntico)",
  caracter: "Un solo carácter: el punto final de la primera cláusula pasa a ser coma",
  anexo: "Anexo: se agregó una página al final",
};

function contract([name, id, role, salary, start], o = {}) {
  const pay = o.salary ?? salary;
  return {
    title: "CONTRATO INDIVIDUAL DE TRABAJO A TÉRMINO INDEFINIDO",
    intro: `Entre ${COMPANY.name}, NIT ${COMPANY.nit}, representada por ${COMPANY.rep}, en adelante EL EMPLEADOR, y ${name}, identificado(a) con cédula de ciudadanía ${id}, en adelante EL TRABAJADOR, se celebra el presente contrato, regido por el Código Sustantivo del Trabajo y por las siguientes cláusulas:`,
    clauses: [
      `PRIMERA. Objeto. EL TRABAJADOR se obliga a prestar sus servicios personales como ${role}, en la ciudad de ${COMPANY.city}, cumpliendo las funciones propias del cargo.`,
      `SEGUNDA. Salario. EL EMPLEADOR pagará un salario mensual de ${money(pay)} pesos colombianos, pagadero por quincenas vencidas mediante transferencia bancaria.`,
      `TERCERA. Duración. El contrato es a término indefinido y empieza a ejecutarse el ${start}. Los primeros dos (2) meses corresponden al periodo de prueba.`,
      "CUARTA. Jornada. La jornada será de lunes a viernes, dentro de los límites de la jornada máxima legal vigente.",
      "QUINTA. Confidencialidad y datos personales. EL TRABAJADOR guardará reserva sobre la información de EL EMPLEADOR y tratará los datos personales conforme a la Ley 1581 de 2012.",
      "SEXTA. Firma electrónica. Las partes aceptan la validez de este documento en formato digital conforme a la Ley 527 de 1999.",
    ],
    signers: [[COMPANY.rep, "EL EMPLEADOR"], [o.signer ?? name, "EL TRABAJADOR"]],
  };
}

function nda([name, id, purpose, term], o = {}) {
  return {
    title: "ACUERDO DE CONFIDENCIALIDAD",
    intro: `Entre ${COMPANY.name}, NIT ${COMPANY.nit}, en adelante LA EMPRESA, y ${name}, identificado(a) con cédula de ciudadanía ${id}, en adelante EL RECEPTOR, se celebra el presente acuerdo de confidencialidad:`,
    clauses: [
      `PRIMERA. Objeto. Proteger la información que LA EMPRESA entregue a EL RECEPTOR con ocasión de la ${purpose}.`,
      "SEGUNDA. Información confidencial. Es toda información técnica, financiera, comercial o de personas, entregada por cualquier medio, que no sea de conocimiento público.",
      "TERCERA. Obligaciones. EL RECEPTOR no divulgará, copiará ni usará la información para fines distintos al objeto, y la devolverá o destruirá al terminar.",
      `CUARTA. Vigencia. Las obligaciones de este acuerdo se mantienen durante ${o.term ?? term} contados a partir de la firma.`,
      "QUINTA. Incumplimiento. El incumplimiento faculta a LA EMPRESA para reclamar los perjuicios causados conforme a la ley colombiana.",
    ],
    signers: [[COMPANY.rep, "LA EMPRESA"], [o.signer ?? name, "EL RECEPTOR"]],
  };
}

function wrap(text, font, size, width) {
  const lines = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > width && line) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

async function render(doc, meta) {
  const pdf = await PDFDocument.create({ updateMetadata: false });
  setMetadata(pdf, meta.title, COMPANY.name, CREATED);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const page = pdf.addPage([612, 792]);
  const left = 72, width = 468;
  let y = 720;
  const write = (text, f = font, size = 10.5, gap = 15) => {
    for (const l of wrap(text, f, size, width)) { page.drawText(l, { x: left, y, size, font: f }); y -= gap; }
    y -= 6;
  };
  page.drawText(meta.code, { x: left, y: 750, size: 8, font, color: rgb(0.45, 0.45, 0.45) });
  write(doc.title, bold, 13, 18);
  write(doc.intro);
  doc.clauses.forEach((c) => write(c));
  y -= 30;
  doc.signers.forEach(([name, role], i) => {
    const x = left + i * 250;
    page.drawLine({ start: { x, y }, end: { x: x + 200, y }, thickness: 0.7 });
    page.drawText(name, { x, y: y - 14, size: 9.5, font: bold });
    page.drawText(role, { x, y: y - 27, size: 9, font });
  });
  page.drawText("Documento sintético para pruebas del sistema TrazaDoc. Datos ficticios.", { x: left, y: 40, size: 7.5, font, color: rgb(0.45, 0.45, 0.45) });
  return pdf.save({ useObjectStreams: false });
}

function setMetadata(pdf, title, author, modified) {
  pdf.setTitle(title);
  pdf.setAuthor(author);
  pdf.setCreator("TrazaDoc - generador de documentos de prueba");
  pdf.setProducer("pdf-lib");
  pdf.setCreationDate(CREATED);
  pdf.setModificationDate(modified);
}

async function tamper(kind, build, source, original, meta) {
  if (kind === "texto") return render(build(source, meta.textOverride), meta);
  if (kind === "firma") return render(build(source, { signer: "Persona No Autorizada Ficticia" }), meta);
  if (kind === "caracter") {
    const d = build(source);
    d.clauses[0] = d.clauses[0].replace(/\.$/, ",");
    return render(d, meta);
  }
  const pdf = await PDFDocument.load(original, { updateMetadata: false });
  if (kind === "metadatos") {
    pdf.setAuthor("Usuario externo");
    pdf.setModificationDate(TAMPERED_AT);
  } else {
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const page = pdf.addPage([612, 792]);
    page.drawText("ANEXO 1. OTROSÍ", { x: 72, y: 720, size: 13, font });
    page.drawText("Las partes acuerdan modificar las condiciones pactadas en este documento.", { x: 72, y: 690, size: 10.5, font });
  }
  return pdf.save({ useObjectStreams: false });
}

const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const slug = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().split(" ").slice(0, 2).join("-");

mkdirSync(join(OUT, "originales"), { recursive: true });
mkdirSync(join(OUT, "alterados"), { recursive: true });

const items = [
  ...EMPLOYEES.map((e, i) => ({ code: `C${String(i + 1).padStart(2, "0")}`, kind: "Contrato laboral", source: e, build: contract,
    textOverride: { salary: e[3] + 300000 }, textDetail: `salario de ${money(e[3])} a ${money(e[3] + 300000)}` })),
  ...NDA_PARTIES.map((p, i) => ({ code: `N${String(i + 1).padStart(2, "0")}`, kind: "Acuerdo de confidencialidad", source: p, build: nda,
    textOverride: { term: "diez (10) años" }, textDetail: `vigencia de ${p[3]} a diez (10) años` })),
];

const manifest = [];
for (const [i, it] of items.entries()) {
  const kind = TAMPERINGS[i % TAMPERINGS.length];
  const base = `${it.code}-${it.kind.startsWith("Contrato") ? "contrato" : "confidencialidad"}-${slug(it.source[0])}`;
  const meta = { code: `${it.code} · ${it.kind}`, title: it.build(it.source).title, textOverride: it.textOverride };
  const original = await render(it.build(it.source), meta);
  const altered = await tamper(kind, it.build, it.source, original, meta);
  const files = { original: `originales/${base}.pdf`, alterado: `alterados/${base}-alterado-${kind}.pdf` };
  writeFileSync(join(OUT, files.original), original);
  writeFileSync(join(OUT, files.alterado), altered);
  manifest.push({
    codigo: it.code, tipo: it.kind, persona: it.source[0], alteracion: kind,
    detalle: kind === "texto" ? `Texto: ${it.textDetail}` : TAMPER_LABEL[kind],
    ...files, sha256Original: sha256(original), sha256Alterado: sha256(altered),
  });
}
writeFileSync(join(OUT, "manifiesto.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`Listo: ${manifest.length} originales y ${manifest.length} alterados en docs/documentos-prueba/`);
for (const k of TAMPERINGS) console.log(`  ${k.padEnd(10)} ${manifest.filter((m) => m.alteracion === k).length} documentos`);
