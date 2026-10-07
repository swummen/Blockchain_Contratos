# Modelado UML — OE2 (Diseño de Arquitectura y Modelado del Sistema)

Diagramas en formato PlantUML (`.puml`), un diagrama por archivo, elaborados a partir de:

- `docs/md/Trabajo de grado final.md` — Fase 2 (OE2) exige como entregable "Diagramas UML
  (Componentes, Secuencia y Despliegue)".
- `docs/md/SRS_v2_Requerimientos (2).md` — RF-001 a RF-053 y RNF-001 a RNF-030, usados para que
  cada paso de las secuencias cite el requerimiento que representa.
- `docs/md/Matriz_Actores_Stakeholders.md` — define los 3 roles operativos del sistema
  (Empleado, Verificador, Administrador) usados en los diagramas de secuencia.

## Contenido

| Archivo | Diagrama | Origen |
| --- | --- | --- |
| `00-diagrama-casos-de-uso.puml` | Casos de uso | Complementario (no exigido explícitamente, se agrega para mostrar el sistema completo de un vistazo) |
| `01-diagrama-componentes.puml` | Componentes | Exigido en Fase 2 / OE2 |
| `02-diagrama-despliegue.puml` | Despliegue (topología Docker) | Exigido en Fase 2 / OE2 |
| `03-diagrama-mer.puml` | Modelo Entidad-Relación (Usuario, Documento, EventoTrazabilidad) | Solicitado explícitamente, no está en el documento fuente |
| `04-secuencia-autenticacion.puml` | Secuencia: login + 2FA (transversal a los 3 roles) | Complementario, cubre RF-001 a RF-007 |
| `05-secuencia-rol-empleado.puml` | Secuencia: rol Empleado | Exigido en Fase 2 / OE2, cubre RF-008 a RF-022 |
| `06-secuencia-rol-verificador.puml` | Secuencia: rol Verificador | Exigido en Fase 2 / OE2, cubre RF-023 a RF-040 |
| `07-secuencia-rol-administrador.puml` | Secuencia: rol Administrador | Exigido en Fase 2 / OE2, cubre RF-041 a RF-051 |

## Cómo visualizarlos

Cualquiera de estas opciones funciona porque son archivos de texto plano estándar PlantUML:

1. **VS Code (recomendado):** instalar la extensión "PlantUML" (jebbs.plantuml) y abrir el
   `.puml` con `Alt+D` para la vista previa. Requiere Java y Graphviz instalados localmente,
   o usar el servidor público de PlantUML (configuración por defecto de la extensión).
2. **Servidor web sin instalar nada:** pegar el contenido de un `.puml` en
   https://www.plantuml.com/plantuml/uml/
3. **Línea de comandos:** `plantuml docs/uml/*.puml` genera un `.png` por cada diagrama
   (requiere `plantuml.jar` + Java).

## Notas de diseño

- El MER modela Usuario/Documento/EventoTrazabilidad como si fueran entidades relacionales
  por claridad conceptual, aunque la persistencia real (`RNF-13`) es MongoDB (no relacional)
  + Hyperledger Fabric (ledger). Ver la nota dentro de `03-diagrama-mer.puml`.
- Las secuencias de Empleado, Verificador y Administrador asumen que el login (RF-001 a RF-007,
  ver `04-secuencia-autenticacion.puml`) ya ocurrió.
- Nombres de servicios/controladores (`Document Controller`, `Fabric Gateway Service`, etc.)
  son una propuesta de diseño derivada de RNF-019 (arquitectura modular) y RNF-020 (el frontend
  nunca habla directo con Fabric); no hay código aún que los defina, así que quedan sujetos a
  cambio cuando se implemente `backend/`.
