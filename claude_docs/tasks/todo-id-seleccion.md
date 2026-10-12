# TODO — Selección de documento en dos pasos (persona → contrato) · RF‑24 / HU‑010

Plan: `claude_docs/tasks/plan-id-seleccion.md` (acordado 2026‑10‑12).
Fuente de verdad: `claude_docs/SPEC.md` (RF‑24, nota de cambio Sprint 4).
Estado: **COMPLETO. T1, T2 y T3 cerrados. Falta solo el visto bueno de Sofia en
navegador y el commit (mensaje redactado en T3).**
No hacer `git commit` automático — solo dejar el mensaje redactado (norma del equipo).

---

## T1: Frontend — selección en dos pasos (persona → contrato)

**Descripción:** Reemplazar la lista plana de `VerificarIntegridadPage` por una selección
en dos pasos (persona → su contrato), conservando el ingreso manual del `documentId` como
vía secundaria. Sin cambios de backend (D4).

**Criterios de aceptación:**
- [x] Paso 1: selector con las **personas** responsables (nombre + cantidad de
  documentos, una sola vez por persona), derivado de `listDocuments` agrupando por
  `responsibleUser` y mostrando `responsibleName`, ordenado por nombre.
- [x] Paso 2: al elegir una persona, se listan **solo sus contratos** (nombre, fecha,
  estado); elegir uno dispara el `handleLookup(documentId)` ya existente con el UUID
  interno (que no se muestra ni se teclea).
- [x] El panel del documento elegido muestra al **responsable** (hallazgo #2 del reporte
  de QA), además de nombre y fecha. El nombre sale del listado; si el documento se buscó
  a mano y no está en la lista, cae al userId de `getDocument`.
- [x] El ingreso manual del `documentId` se conserva como opción **secundaria/colapsada**
  (link "¿No lo encontrás? Ingresar el identificador a mano", D5), con el mensaje de
  "no se pudo cargar el listado → ingresá el identificador".
- [x] El flujo posterior (subir archivo, comparar, "Nueva verificación") no cambia.
- [x] `npm run build`/`npm run lint` pasan (0 errores).

**Verificación:**
- [x] En navegador (Playwright, 2026‑10‑12): paso 1 lista "María López · 3 documentos";
  paso 2 lista sus 3 contratos (incluidos dos con fecha/estado distintos) con nombre,
  fecha y estado; al elegir, el panel muestra "Responsable · María López" + el hash
  registrado; ingreso manual de un UUID inexistente → "El documento no está registrado".
  Falta T2 (reproducir con **dos personas** que tengan un archivo homónimo — hoy solo
  un Empleado tiene documentos sembrados).

**Dependencias:** ninguna.

**Archivos:** `frontend/src/pages/verificador/VerificarIntegridadPage.tsx`.

**Alcance:** M.

---

## T2: Verificación manual del flujo nuevo contra el stack real

**Criterios de aceptación:**
- [x] Subir dos contratos distintos con el mismo nombre de archivo desde dos empleados
  distintos; confirmar que el Verificador los distingue (paso 1 por persona) y elige el
  correcto. Se subió a `c.ruiz` (Carlos Ruiz, U002) un `CONTRATO FALSO.pdf` — mismo
  nombre que los de María López. El paso 1 lista ambas personas; cada una muestra su
  propio `CONTRATO FALSO.pdf` por separado.
- [x] Verificar con el archivo correcto → "Integridad confirmada"; con uno alterado →
  "Integridad comprometida". El documento de Carlos comparado con **su** archivo →
  confirmada (prueba que apuntó al documento de Carlos, no al homónimo de María: si
  hubiera apuntado al de María, el hash no coincidiría); comparado con un archivo
  distinto → comprometida. El panel de evidencia muestra "Carlos Ruiz" como responsable.
- [x] Ingreso manual de un `documentId` inexistente → "El documento no está registrado".

**Verificación:**
- [x] E2E (Playwright, 2026‑10‑12): todo lo anterior en verde, 0 problemas. Falta la
  confirmación final de Sofia en navegador.

**Nota:** la prueba dejó en Mongo/ledger un documento `CONTRATO FALSO.pdf` de `c.ruiz`
(U002), Pendiente. Se limpia con `docker/down.sh` (reinicia el entorno).

**Dependencias:** T1.

**Alcance:** S.

---

## T3: Documentación y cierre

**Criterios de aceptación:**
- [x] `claude_docs/SPEC.md`: RF‑24 con la nota de cambio (Sprint 4, selección en dos
  pasos) — coherente con lo implementado.
- [x] `para_sofi.md`: bloque "✅ Resuelto (2026-10-12)" al final de la sección 3 con cómo
  quedó la selección; sección 6 (pendientes) y fecha de última actualización al día.
- [x] Mensaje de commit redactado (sin commit automático) — ver abajo.

**Dependencias:** T2.

**Alcance:** S.

### Mensaje de commit redactado

```
Selección de documento en dos pasos (persona → contrato) — RF-24

- VerificarIntegridadPage: elegir primero la persona responsable y luego
  su contrato, en vez de una lista plana de nombres de archivo. Resuelve
  la ambigüedad entre contratos homónimos de personas distintas.
- El panel de evidencia muestra al responsable del documento elegido.
- El UUID queda interno; ingreso manual del identificador como vía
  secundaria colapsada.
- SPEC.md: nota de cambio en RF-24. para_sofi.md: sección 3 marcada como
  resuelta. Plan y todo en claude_docs/tasks/{plan,todo}-id-seleccion.md.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
```
