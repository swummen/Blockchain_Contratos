# Plan de implementación: Selección de documento en dos pasos (persona → contrato)

> Fuente de verdad: `claude_docs/SPEC.md` (RF‑24, nota de cambio Sprint 4; HU‑010).
> Propuesta de Sofia, acordada 2026‑10‑12. Refina RF‑24 / HU‑010‑CA‑01.
> **No** toca el chaincode ni el modelo de datos. **No** hay commit automático.

## Problema

Hoy `VerificarIntegridadPage` ofrece una **lista plana** de documentos registrados por
nombre de archivo (más el ingreso manual del `documentId`). Dos contratos llamados igual
(`contrato.pdf`) de empleados distintos son indistinguibles en esa lista: el Verificador
puede elegir el equivocado, y el sistema confirmaría la integridad del documento que no
era. La comparación de huellas SHA‑256 es correcta; el hueco está en **elegir contra qué
documento comparar**.

(Confirmado en la prueba E2E del 2026‑10‑12: el desplegable mostraba dos
`CONTRATO FALSO.pdf` del mismo responsable, distinguibles solo por fecha y estado.)

## Propuesta (acordada con Sofia)

Selección en **dos pasos**:
1. **Elegir a la persona responsable** (por nombre): una sola vez por persona.
2. **Elegir su contrato**: solo los contratos de esa persona, con nombre, fecha y estado.

Al estar acotado a una persona, no hay ambigüedad entre archivos homónimos de distintos
empleados. El `documentId` (UUID) sigue siendo la clave real de búsqueda, pero queda
**interno** (no se muestra ni se teclea). El paso 3 (subir el PDF a comparar, generar y
comparar el hash, registrar en el ledger) **no cambia**.

## Decisiones

| # | Decisión | Razón |
|---|---|---|
| D1 | **Solo reorganizar la lista existente**, sin "solicitar verificación". | El Verificador ya puede ver todos los documentos (RF‑37/38); agregar una cola de solicitudes es un actor/flujo nuevo fuera de alcance (lo eligió Sofia). |
| D2 | **Responsable = quien subió** (`responsibleUser`/`responsibleName`), no un actor nuevo. | No se agrega "empleador" como entidad; sin cambio de modelo de datos (lo eligió Sofia). |
| D3 | **Sin código corto legible** por ahora. | El selector persona → contrato ya hace innecesario recordar/dictar un id; el UUID queda interno. Se evaluará un código corto más adelante si hace falta. |
| D4 | **Sin cambios de backend.** `GET /documents` ya devuelve `documentId`, `name`, `responsibleUser`, `responsibleName`, `registeredAt`, `status`. | Todo lo que necesita el agrupado por persona ya viaja en el listado (corrección de T7). |
| D5 | **Conservar el ingreso manual del `documentId`** como vía secundaria (colapsada). | Red de seguridad si un documento no está en los primeros 100 del listado, o si el listado no cargó (RF‑24 lo permite explícitamente). |
| D6 | **Mostrar al responsable en el panel del documento elegido.** | Resuelve el hallazgo #2 del reporte de QA (el panel no mostraba a quién pertenecía el documento); da la confirmación "estoy verificando el contrato de María López". |

## Grafo de dependencias

```
T1 (frontend: selección en dos pasos) ──> T2 (verificación manual) ──> T3 (docs + cierre)
```

## Rebanado vertical

- **T1** deja la pantalla usable de punta a punta con el flujo nuevo (build/lint verdes).
- **T2** confirma contra el stack real que la ambigüedad se resolvió y que verificar
  (coincide / alterado / id inexistente) sigue funcionando.
- **T3** documentación al día y mensaje de commit redactado.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Una misma persona con dos archivos homónimos sigue siendo ambigua. | Mostrar fecha + estado (y, si hiciera falta, un contador) en el paso 2; es un caso mucho más raro que dos personas distintas. |
| El listado se corta en 100 (sin paginación, D8 Sprint 3). | Se conserva el ingreso manual del id (D5); la paginación/búsqueda real es alcance futuro (RF‑37…40 completo). |
| Regresión en el flujo de comparación ya probado. | T2 reejecuta el flujo completo (coincide/alterado) además de la selección nueva. |

## Lista de tareas

Ver `claude_docs/tasks/todo-id-seleccion.md`. Índice:

| # | Título | Alcance | Depende de |
|---|---|---|---|
| T1 | Frontend: selección en dos pasos (persona → contrato) | M | N/A |
| T2 | Verificación manual del flujo nuevo contra el stack real | S | T1 |
| T3 | Documentación y cierre | S | T2 |

## Definición de Terminado

1. La ambigüedad entre documentos homónimos de personas distintas queda resuelta en la UI.
2. Verificar un documento (coincide / alterado / id inexistente) sigue funcionando.
3. `npm run build`/`lint` del frontend pasan; sin cambios de backend/chaincode.
4. RF‑24 / HU‑010 al día en `SPEC.md` (nota de cambio ya agregada).
5. Mensaje(s) de commit redactado(s): sin commit automático.
