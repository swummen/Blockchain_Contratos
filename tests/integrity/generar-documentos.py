"""Genera los 20 documentos sintéticos de la prueba de integridad (OE4, RNF-14) a
partir de las plantillas del equipo (docs/documentos-prueba/plantillas/):

- 12 contratos laborales: "Plantilla de Contrato de Empleado.docx", llenada con datos
  ficticios.
- 8 acuerdos de confidencialidad: el modelo de la OEPM, adaptado a Colombia (cédula,
  NIT, ley colombiana), armado con los mismos estilos de la plantilla del contrato.

Cada documento tiene una copia alterada (5 tipos, 4 de cada uno). La conversión a PDF
la hace Microsoft Word, por eso solo corre en Windows con Word instalado.

Uso (desde la raíz del repo): python tests/integrity/generar-documentos.py
"""
import hashlib
import json
import re
import shutil
import subprocess
import tempfile
import zipfile
from pathlib import Path
from xml.sax.saxutils import escape

import pymupdf

REPO = Path(__file__).resolve().parents[2]
OUT = REPO / "docs" / "documentos-prueba"
TEMPLATE = OUT / "plantillas" / "Plantilla de Contrato de Empleado.docx"

COMPANY = {
    "name": "Comercializadora Ficticia del Valle S.A.S.",
    "nit": "900.000.000-1",
    "rep": "Andrés Felipe Prueba Gómez",
    "rep_id": "1.000.000.001",
    "address": "Calle 10 # 4-50",
    "city": "Cali",
    "region": "Valle del Cauca",
    "zip": "760001",
    "country": "Colombia",
    "web": "comercializadoraficticia.com.co",
    "phone": "+57 602 000 0000",
    "hr": "Natalia Recursos Ficticia",
}
SIGN_DATE = "1 de octubre de 2026"
FORGED_SIGNER = "Persona No Autorizada Ficticia"

# nombre, cédula, cargo, salario mensual, fecha de inicio, jefe inmediato
EMPLOYEES = [
    ("Laura Camila Ruiz Ficticia", "1.000.000.101", "Analista de Talento Humano", 3200000, "3 de febrero de 2026", "Natalia Recursos Ficticia"),
    ("Juan Sebastián Mora Ejemplo", "1.000.000.102", "Auxiliar Contable", 2100000, "10 de febrero de 2026", "Jorge Finanzas Demo"),
    ("Valentina Ortiz Simulada", "1.000.000.103", "Desarrolladora de Software", 5400000, "2 de marzo de 2026", "Mauricio Tecnología Prueba"),
    ("Carlos Andrés Peña Demo", "1.000.000.104", "Coordinador de Logística", 4100000, "16 de marzo de 2026", "Héctor Operaciones Ejemplo"),
    ("Daniela Rojas Inventada", "1.000.000.105", "Asesora Comercial", 2500000, "1 de abril de 2026", "Lucía Ventas Simulada"),
    ("Miguel Ángel Torres Prueba", "1.000.000.106", "Técnico de Soporte", 2300000, "15 de abril de 2026", "Mauricio Tecnología Prueba"),
    ("Sara Lucía Gómez Ficticia", "1.000.000.107", "Abogada Laboralista", 4800000, "4 de mayo de 2026", "Natalia Recursos Ficticia"),
    ("Felipe Castro Ejemplo", "1.000.000.108", "Jefe de Compras", 5000000, "18 de mayo de 2026", "Héctor Operaciones Ejemplo"),
    ("Mariana Herrera Simulada", "1.000.000.109", "Diseñadora Gráfica", 2900000, "1 de junio de 2026", "Lucía Ventas Simulada"),
    ("Santiago López Demo", "1.000.000.110", "Operario de Bodega", 1750000, "16 de junio de 2026", "Héctor Operaciones Ejemplo"),
    ("Isabella Vargas Inventada", "1.000.000.111", "Analista de Datos", 4500000, "1 de julio de 2026", "Mauricio Tecnología Prueba"),
    ("Tomás Ramírez Prueba", "1.000.000.112", "Auxiliar Administrativo", 1900000, "15 de julio de 2026", "Jorge Finanzas Demo"),
]
# nombre, cédula, objeto de la colaboración, vigencia de la confidencialidad
NDA_PARTIES = [
    ("Natalia Moreno Ficticia", "1.000.000.201", "consultoría en procesos de nómina", "dos (2) años"),
    ("Esteban Quintero Ejemplo", "1.000.000.202", "auditoría de sistemas de información", "tres (3) años"),
    ("Paula Andrea Ríos Simulada", "1.000.000.203", "desarrollo de un módulo de facturación", "dos (2) años"),
    ("Diego Alejandro Cruz Demo", "1.000.000.204", "revisión de contratos con proveedores", "un (1) año"),
    ("Camila Fernández Inventada", "1.000.000.205", "migración de la base de datos de clientes", "tres (3) años"),
    ("Andrés Salazar Prueba", "1.000.000.206", "asesoría tributaria", "dos (2) años"),
    ("Juliana Pardo Ficticia", "1.000.000.207", "capacitación del área comercial", "un (1) año"),
    ("Ricardo Mejía Ejemplo", "1.000.000.208", "evaluación de seguridad de la red interna", "cinco (5) años"),
]

TAMPERINGS = ["texto", "firma", "metadatos", "caracter", "anexo"]
TAMPER_LABEL = {
    "firma": "Firma: el firmante pasa a ser \"Persona No Autorizada Ficticia\"",
    "metadatos": "Metadatos: autor y fecha de modificación del PDF (contenido visible idéntico)",
    "caracter": "Un solo carácter: un punto final de la cláusula 1.1 pasa a ser coma",
    "anexo": "Anexo: se agregó una página de otrosí al final",
}


def money(n: int) -> str:
    return "$" + f"{n:,}".replace(",", ".")


def slug(name: str) -> str:
    import unicodedata
    plain = unicodedata.normalize("NFD", name).encode("ascii", "ignore").decode()
    return "-".join(plain.lower().split()[:2])


def email_of(name: str) -> str:
    return slug(name).replace("-", ".") + "@correo-ficticio.co"


# --- Contrato laboral: se llenan los marcadores [..] de la plantilla ------------------
def replace_once(xml: str, old: str, new: str) -> str:
    assert old in xml, f"no se encontró en la plantilla: {old}"
    return xml.replace(old, escape(new), 1)


def fill_contract(xml: str, emp, salary=None, signer=None, one_char=False) -> str:
    name, cid, role, monthly, start, boss = emp
    annual = (salary or monthly) * 12
    signer = signer or name
    phone = "+57 300 000 0" + cid[-3:]
    for old, new in [
        ("[[Número de teléfono]. Dirección]", f"Carrera {int(cid[-2:]) + 1} # 20-{cid[-2:]}, {COMPANY['city']}"),
        ("[Nombre] [Apellido] (el &quot;Empleado&quot;), con domicilio en […]", f"{name} (el \"Empleado\"), identificado(a) con cédula de ciudadanía {cid}, con domicilio en {COMPANY['city']}"),
        ("Reportar a [Nombre]", f"Reportar a {boss}"),
        ("Gerente de Contratación: [Nombre]", f"Gerente de Contratación: {COMPANY['hr']}"),
        ("[…] (por ejemplo, 3 meses)", "dos (2) meses"),
        ("[…] horas por semana", "cuarenta y dos (42) horas por semana"),
        ("[…] (p. ej., 6 meses)", "seis (6) meses"),
        ("[…] (ámbito geográfico)", "el territorio de la República de Colombia"),
        ("período de […] posterior", "período de seis (6) meses posterior"),
        ("[…] (p. ej., 2 semanas, 1 mes)", "treinta (30) días calendario"),
        ("las leyes de […]", "las leyes de la República de Colombia"),
        ("dentro de […] días", "dentro de treinta (30) días"),
        ("arbitraje vinculante en […] de conformidad con las reglas de […]", f"arbitraje vinculante en {COMPANY['city']} de conformidad con las reglas del Centro de Arbitraje y Conciliación de la Cámara de Comercio de {COMPANY['city']}"),
        ("[Monto] por año", f"{money(annual)} pesos colombianos por año ({money(salary or monthly)} mensuales)"),
        ("[Empleador]", "la República de Colombia"),
        ("[Firma del Representante del Empleador]", f"Firmado electrónicamente por {COMPANY['rep']}"),
        ("[Firma del Empleado]", f"Firmado electrónicamente por {signer}"),
        ("[Nombre del Representante del Empleador]", COMPANY["rep"]),
        ("[Cargo del Representante del Empleador]", "Representante legal"),
        ("[Empresa]", COMPANY["name"]),
    ]:
        xml = replace_once(xml, old, new)
    if one_char:
        xml = replace_once(xml, "le asigne de tiempo en tiempo.", "le asigne de tiempo en tiempo,")
    # Marcadores repetidos, en el orden en que aparecen en la plantilla.
    sequences = {
        "[Nombre] [Apellido]": [name, name, name],
        "[Firma]": [f"Firmado electrónicamente por {COMPANY['rep']}", f"Firmado electrónicamente por {signer}"],
        "[Título]": ["Representante legal", role],
        "[Correo electrónico]": [email_of(name), f"info@{COMPANY['web']}", email_of(name)],
        "[Número de teléfono]": [phone, COMPANY["phone"], COMPANY["phone"], phone],
        "[Nombre]": [COMPANY["rep"]],
        "[Fecha]": [SIGN_DATE] * 4,
    }
    for marker, values in sequences.items():
        for value in values:
            xml = replace_once(xml, marker, value)
    for marker, value in [
        ("[Fecha de entrada en vigor]", start), ("[Fecha de Inicio]", start), ("[Nombre de la empresa]", COMPANY["name"]),
        ("[Nombre del proyecto]", role), ("[Dirección]", COMPANY["address"]), ("[Ciudad]", COMPANY["city"]),
        ("[Estado/Región]", COMPANY["region"]), ("[Código postal]", COMPANY["zip"]), ("[País/Región]", COMPANY["country"]),
        ("[Sitio web de la empresa]", COMPANY["web"]),
    ]:
        xml = xml.replace(marker, escape(value))
    leftover = re.findall(r"\[[^\]<]{0,40}\]|\[…\]", re.sub(r"<[^>]+>", "", xml))
    assert not leftover, f"marcadores sin llenar: {leftover}"
    return xml


# --- Acuerdo de confidencialidad (modelo OEPM adaptado a Colombia) -------------------
def p(text: str, style: str | None = None, bold: bool = False, center: bool = False) -> str:
    ppr = ""
    if style or center:
        ppr = "<w:pPr>" + (f'<w:pStyle w:val="{style}"/>' if style else "") + ('<w:jc w:val="center"/>' if center else "") + "</w:pPr>"
    rpr = "<w:rPr><w:b/></w:rPr>" if bold else ""
    return f'<w:p>{ppr}<w:r>{rpr}<w:t xml:space="preserve">{escape(text)}</w:t></w:r></w:p>'


def nda_body(party, term=None, signer=None, one_char=False) -> str:
    name, cid, purpose, base_term = party
    term = term or base_term
    signer = signer or name
    c = COMPANY
    obj_end = "según se describe en las manifestaciones III y IV" + ("," if one_char else ".")
    parts = [
        p("ACUERDO DE CONFIDENCIALIDAD", "Title"),
        p(f"ENTRE {c['name'].upper()} (PARTE A) Y {name.upper()} (PARTE B)", center=True, bold=True),
        p(f"En {c['city']}, a {SIGN_DATE}"),
        p("REUNIDOS", "Heading1"),
        p(f"De una parte, {c['rep']}, con cédula de ciudadanía {c['rep_id']}, representando en este acto a {c['name']}, con sede en {c['address']}, {c['city']}, {c['region']}, y NIT {c['nit']}, inscrita en la Cámara de Comercio de {c['city']}, de la que es Representante legal, cargo que le faculta para representar a la empresa (en adelante \"Parte A\")."),
        p(f"De otra parte, {name}, con cédula de ciudadanía {cid}, actuando en nombre propio como contratista independiente, con domicilio en {c['city']} (en adelante \"Parte B\")."),
        p("Parte A y Parte B recibirán en adelante la denominación de la \"Parte\" por separado y las \"Partes\" de forma conjunta. Se reconocen ambas Partes con capacidad legal suficiente y poder bastante para este acto y, a tal efecto,"),
        p("MANIFIESTAN", "Heading1"),
        p("I. Que Parte A es una empresa que desarrolla su actividad en el sector de la comercialización de bienes y servicios."),
        p(f"II. Que Parte B presta servicios profesionales de {purpose}."),
        p(f"III. Que Parte A y Parte B desean intercambiar determinada información relativa a la {purpose}, con el fin de valorar y ejecutar una colaboración entre las Partes."),
        p("IV. Que las Partes desean proteger la anteriormente mencionada información de su uso y divulgación no autorizados y, a tal efecto, están interesadas en firmar el presente Acuerdo de Confidencialidad (en adelante, el Acuerdo) según las siguientes:"),
        p("CLÁUSULAS", "Heading1"),
        p("1. OBJETO", "Heading1"),
        p(f"1.1. Por medio del presente Acuerdo las Partes establecen los términos y condiciones que regularán el intercambio de Información Confidencial efectuado por las Partes con motivo de la evaluación de una posible colaboración entre ellas, {obj_end}"),
        p("2. DEFINICIÓN DE INFORMACIÓN CONFIDENCIAL", "Heading1"),
        p("2.1. Por \"Información Confidencial\" se entiende toda aquella información, oral o escrita, comunicada por una parte (\"Parte Emisora\") a la otra (\"Parte Receptora\") con objeto de la evaluación de una posible colaboración, incluyendo, entre otras, informaciones de carácter científico, técnico, financiero, legal, fiscal y comercial, modelos y estrategias de negocio, \"know how\", nombres de posibles clientes y socios, proyectos y operaciones propuestas o en fase de estudio, informes, planos, proyecciones de mercado y datos, junto con los análisis y documentos de trabajo, recopilaciones, comparaciones, estudios y, en general, toda la información que las Partes se transmitan ya sea con anterioridad o posterioridad a la firma del presente Acuerdo."),
        p(f"2.2. En particular, la Información Confidencial incluirá, pero no se limitará a, cualquier información relacionada con la {purpose}."),
        p("2.3. Las Partes acuerdan identificar la información intercambiada como Información Confidencial. Las Partes levantarán acta de las reuniones en las que oralmente se intercambie Información Confidencial y marcarán los documentos como Información Confidencial. Sin embargo, la ausencia de dicha identificación no anulará la naturaleza confidencial de dicha información."),
        p("3. OBLIGACIONES DE LAS PARTES", "Heading1"),
        p("3.1. Las Partes intercambiarán Información Confidencial para explorar posibles vías de colaboración y se comprometen a tomar las precauciones necesarias y apropiadas para mantener como confidencial la información así definida, y en especial a: (a) utilizar la Información Confidencial de forma reservada; (b) no divulgar ni comunicar la Información Confidencial facilitada por la Parte Emisora; (c) impedir la copia o revelación de esa información a terceros, salvo que gocen de aprobación escrita de la Parte Emisora y únicamente en los términos de tal aprobación; (d) restringir el acceso a la Información Confidencial a sus respectivos empleados, asociados, subcontratados y a cualquier persona que, por su relación con las Partes, pueda o deba tener acceso a dicha información, advirtiendo de dicho deber de confidencialidad; y (e) utilizar la Información Confidencial o fragmentos de ésta exclusivamente para los fines de la ejecución del presente Acuerdo, absteniéndose de cualquier otro uso."),
        p("3.2. Las Partes serán responsables entre sí ante el incumplimiento de esta obligación, ya sea por sus empleados, asociados, subcontratados o cualquier otra persona a la que hubieran revelado la Información Confidencial."),
        p("3.3. Las Partes declaran su reconocimiento y respeto hacia la legislación vigente en materia de protección de datos personales, en particular la Ley 1581 de 2012."),
        p("4. EXCEPCIONES AL TRATAMIENTO DE LA INFORMACIÓN CONFIDENCIAL", "Heading1"),
        p("4.1. Sin perjuicio de lo dispuesto en la cláusula anterior, las Partes podrán usar o difundir Información Confidencial que: (a) sea de conocimiento público o llegue al conocimiento público por medios diferentes a una infracción del presente Acuerdo; (b) se haya generado de forma independiente por o para la Parte Receptora, sin ninguna conexión con la Información Confidencial, siempre que dicha generación pueda ser documentada; (c) fuera conocida por la Parte Receptora con anterioridad a la fecha en la que la recibió de la Parte Emisora, siempre que lo pueda demostrar documentalmente; (d) proceda de un tercero que no exija secreto; o (e) deba ser comunicada por ley o por requerimiento judicial o administrativo, caso en el cual la Parte Receptora notificará inmediatamente a la Parte Emisora y no revelará más información que la estrictamente requerida."),
        p("5. PROPIEDAD DE LA INFORMACIÓN CONFIDENCIAL Y AUSENCIA DE GARANTÍA", "Heading1"),
        p("5.1. La Información Confidencial es de propiedad exclusiva de la Parte Emisora. En ningún caso podrá entenderse en virtud del presente Acuerdo que el intercambio de información suponga una cesión o licencia de derechos sobre la misma."),
        p("5.2. La Parte Emisora no presta ninguna garantía acerca de la condición, aptitud, precisión, corrección, integridad, completitud o rendimiento de la Información Confidencial."),
        p("6. DURACIÓN", "Heading1"),
        p(f"6.1. El presente Acuerdo entrará en vigor en el momento de su firma, pero extiende sus efectos a la Información Confidencial revelada con anterioridad. Se extinguirá en los supuestos previstos en la cláusula 11; sin embargo, las obligaciones de confidencialidad y no uso de la Información Confidencial no se extinguirán y continuarán en vigor por un plazo de {term} contados desde la última revelación de Información Confidencial."),
        p("6.2. Sólo podrá ser cambiado el plazo establecido en el párrafo anterior por pacto posterior con referencia expresa, explícita y por escrito a la presente cláusula."),
        p("6.3. Las Partes se obligan a asegurar que los acuerdos con las personas y entidades a las que se refiere la cláusula 3.1 (d) impongan la misma duración, y en particular que ésta no será afectada por la extinción del vínculo laboral, contractual o de otra naturaleza."),
        p("6.4. Una vez extinguido el presente Acuerdo, o antes si así lo requiere la Parte Emisora, en un plazo de siete (7) días hábiles la Parte Receptora devolverá la Información Confidencial y destruirá cualquier copia, resumen, extracto, modificación o traducción de la misma, sin que ello suponga la extinción de las obligaciones asumidas en los párrafos anteriores."),
        p("7. PROHIBICIÓN DE CESIÓN", "Heading1"),
        p("7.1. Ninguna de las Partes podrá ceder sus derechos y obligaciones derivados del presente Acuerdo sin el consentimiento previo y por escrito de la otra."),
        p("8. INCUMPLIMIENTO", "Heading1"),
        p("8.1. Ambas Partes reconocen que cualquier divulgación o uso no autorizado de la Información Confidencial puede causar daños y perjuicios a la Parte Emisora de difícil cuantificación. Por ello, la Parte Emisora tendrá derecho a reclamar ante los jueces competentes una indemnización por los daños y perjuicios que tal divulgación o uso le hayan generado."),
        p("9. MODIFICACIÓN DEL ACUERDO", "Heading1"),
        p("9.1. Cualquier modificación del presente Acuerdo deberá ser acordada previamente por escrito por ambas Partes, con referencia explícita al presente Acuerdo."),
        p("10. DIVISIBILIDAD", "Heading1"),
        p("10.1. Aunque cualquier disposición del presente Acuerdo sea declarada nula, ilegal o inaplicable, las restantes disposiciones mantendrán su validez."),
        p("11. TERMINACIÓN", "Heading1"),
        p("11.1. El presente Acuerdo podrá terminarse, además de por las causas previstas en la legislación vigente, por: (a) la expiración del término pactado; (b) la terminación expresa y por escrito de mutuo acuerdo; o (c) el incumplimiento por una Parte de cualquiera de sus obligaciones, siempre que no sea subsanado en un plazo máximo de treinta (30) días calendario tras petición escrita de subsanación."),
        p("11.2. Sea cual fuere la causa de terminación del Acuerdo, se estará a lo dispuesto en la cláusula 6."),
        p("12. LEY APLICABLE Y JURISDICCIÓN", "Heading1"),
        p(f"12.1. El presente Acuerdo tiene naturaleza privada y está sometido a las leyes de la República de Colombia. Las Partes acuerdan someter toda controversia que surja del presente Acuerdo a los jueces de la ciudad de {c['city']} que resulten competentes."),
        p("13. TOTALIDAD DEL ACUERDO", "Heading1"),
        p("13.1. El presente Acuerdo constituye la totalidad del acuerdo entre las Partes y reemplaza cualquier acuerdo o comunicación anterior, oral o escrita, en relación con su objeto."),
        p("14. NOTIFICACIONES", "Heading1"),
        p("14.1. Todas las notificaciones relacionadas con el presente Acuerdo deberán realizarse por escrito a las siguientes personas:"),
        p(f"Parte A: {c['rep']} · {c['address']}, {c['city']} · info@{c['web']}"),
        p(f"Parte B: {name} · {c['city']} · {email_of(name)}"),
        p("Y en prueba de conformidad de cuanto antecede, firman el presente Acuerdo por duplicado y a un solo efecto en el lugar y fecha arriba citados."),
        p(f"Por Parte A: Firmado electrónicamente por {c['rep']} · Representante legal de {c['name']}"),
        p(f"Por Parte B: Firmado electrónicamente por {signer}"),
    ]
    return "".join(parts)


def build_docx(path: Path, document_xml: str) -> None:
    with zipfile.ZipFile(TEMPLATE) as src, zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as dst:
        for item in src.infolist():
            data = document_xml.encode("utf-8") if item.filename == "word/document.xml" else src.read(item.filename)
            dst.writestr(item, data)


def word_to_pdf(pairs: list[tuple[Path, Path]]) -> None:
    lines = ["$w = New-Object -ComObject Word.Application", "$w.Visible = $false", "$w.DisplayAlerts = 0", "try {"]
    for docx, pdf in pairs:
        lines += [f'  $d = $w.Documents.Open("{docx}", $false, $true)', f'  $d.ExportAsFixedFormat("{pdf}", 17)', "  $d.Close($false)"]
    lines += ["} finally { $w.Quit() }"]
    script = Path(tempfile.gettempdir()) / "trazadoc-word-a-pdf.ps1"
    script.write_text("\n".join(lines), encoding="utf-8-sig")
    subprocess.run(["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", str(script)], check=True)


def tamper_pdf(src: Path, dst: Path, kind: str) -> None:
    doc = pymupdf.open(src)
    if kind == "metadatos":
        meta = doc.metadata
        meta.update({"author": "Usuario externo", "modDate": "D:20261020183000-05'00'"})
        doc.set_metadata(meta)
    else:
        page = doc.new_page()
        page.insert_text((72, 90), "ANEXO 1. OTROSÍ", fontsize=14, fontname="helv")
        page.insert_text((72, 120), "Las partes acuerdan modificar las condiciones pactadas en este documento.", fontsize=11, fontname="helv")
    doc.save(dst)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    template_xml = zipfile.ZipFile(TEMPLATE).read("word/document.xml").decode("utf-8")
    body_start = template_xml.index("<w:body>") + len("<w:body>")
    sect = template_xml.rindex("<w:sectPr")
    nda_xml = lambda body: template_xml[:body_start] + body + template_xml[sect:]

    items = []
    for i, emp in enumerate(EMPLOYEES):
        items.append({"code": f"C{i + 1:02d}", "kind": "Contrato laboral", "person": emp[0], "file": "contrato", "data": emp,
                      "build": lambda d, **o: fill_contract(template_xml, d, **o),
                      "text": {"salary": emp[3] + 300000}, "text_detail": f"salario mensual de {money(emp[3])} a {money(emp[3] + 300000)}"})
    for i, party in enumerate(NDA_PARTIES):
        items.append({"code": f"N{i + 1:02d}", "kind": "Acuerdo de confidencialidad", "person": party[0], "file": "confidencialidad", "data": party,
                      "build": lambda d, **o: nda_xml(nda_body(d, **o)),
                      "text": {"term": "diez (10) años"}, "text_detail": f"vigencia de {party[3]} a diez (10) años"})

    # Se vacían los PDF y no la carpeta: OneDrive puede tener la carpeta bloqueada.
    for folder in ("originales", "alterados"):
        (OUT / folder).mkdir(parents=True, exist_ok=True)
        for old in (OUT / folder).glob("*.pdf"):
            old.unlink()

    work = Path(tempfile.mkdtemp(prefix="trazadoc-docs-"))
    conversions, post = [], []
    for i, it in enumerate(items):
        it["tamper"] = TAMPERINGS[i % len(TAMPERINGS)]
        base = f"{it['code']}-{it['file']}-{slug(it['person'])}"
        it["original"] = f"originales/{base}.pdf"
        it["alterado"] = f"alterados/{base}-alterado-{it['tamper']}.pdf"
        build_docx(work / f"{base}.docx", it["build"](it["data"]))
        conversions.append((work / f"{base}.docx", OUT / it["original"]))
        overrides = {"texto": it["text"], "firma": {"signer": FORGED_SIGNER}, "caracter": {"one_char": True}}.get(it["tamper"])
        if overrides is not None:
            build_docx(work / f"{base}-alterado.docx", it["build"](it["data"], **overrides))
            conversions.append((work / f"{base}-alterado.docx", OUT / it["alterado"]))
        else:
            post.append(it)

    word_to_pdf(conversions)
    for it in post:
        tamper_pdf(OUT / it["original"], OUT / it["alterado"], it["tamper"])
    shutil.rmtree(work, ignore_errors=True)

    manifest = [{
        "codigo": it["code"], "tipo": it["kind"], "persona": it["person"], "alteracion": it["tamper"],
        "detalle": f"Texto: {it['text_detail']}" if it["tamper"] == "texto" else TAMPER_LABEL[it["tamper"]],
        "original": it["original"], "alterado": it["alterado"],
        "sha256Original": sha256(OUT / it["original"]), "sha256Alterado": sha256(OUT / it["alterado"]),
    } for it in items]
    (OUT / "manifiesto.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Listo: {len(items)} originales y {len(items)} alterados en docs/documentos-prueba/")
    for k in TAMPERINGS:
        print(f"  {k:10} {sum(1 for m in manifest if m['alteracion'] == k)} documentos")


if __name__ == "__main__":
    main()
