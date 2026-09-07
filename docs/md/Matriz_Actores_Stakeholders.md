## Matriz de Actores
|  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- |
| MATRIZ DE ACTORES (STAKEHOLDERS) | | | | | | | |
| Fija el universo de requerimientos que ancla el denominador de KPI-1.1 (Cobertura de requerimientos documentados en el SRS). Construida a partir de la estructura real del SRS v2 (53 RF + 30 RNF = 83 requerimientos), organizada por los mismos actores que ya usa el documento de requerimientos. | | | | | | | |
| | | | | | | | |
| N° | Actor / Stakeholder | Rol frente al sistema | Necesidad u objetivo principal | RF asociados (SRS v2) | RNF asociados (SRS v2) | N° de\nrequerimientos | Estado de\naprobación (tutor) |
| 1 | Todos los usuarios\nautenticados | Transversal a los\n3 roles del sistema | Acceder al sistema de forma segura con su rol correspondiente, mediante credenciales y un segundo factor de verificación, y gestionar su propia contraseña. | RF-01 a RF-07\n(autenticación y acceso)\nRF-52, RF-53\n(gestión de credenciales) | RNF-01, RNF-02,\nRNF-03, RNF-07 | 9 | Pendiente de aprobación |
| 2 | Empleado\n(firmante) | Carga y consulta\nde sus documentos | Registrar contratos laborales y NDA en PDF, obtener la huella criptográfica de cada documento, confirmar su registro en blockchain y consultar el estado y la trazabilidad de los documentos que ha cargado. | RF-08 a RF-22 | ""\n(ver Actor normativo) | 15 | Pendiente de aprobación |
| 3 | Verificador | Auditoría de integridad\ndocumental | Seleccionar un documento registrado, cargar la versión a comparar, generar y comparar huellas criptográficas, y consultar el resultado de la verificación y la trazabilidad general de todos los documentos del sistema. | RF-23 a RF-40 | ""\n(ver Actor normativo) | 18 | Pendiente de aprobación |
| 4 | Administrador | Gobierno del sistema\ny de los usuarios | Supervisar el estado consolidado de los documentos registrados, gestionar el ciclo de vida de los usuarios (creación, edición, desactivación lógica) y consultar la trazabilidad administrativa completa. | RF-41 a RF-51 | ""\n(ver Actor normativo) | 11 | Pendiente de aprobación |
| 5 | Actor normativo\n(marco legal y de\nseguridad) | No opera el sistema;\nimpone restricciones\nde diseño | Representa las exigencias transversales derivadas de la Ley 527/1999, el Decreto 2364/2012, la Ley 1581/2012 y los controles A.8.24/A.8.11 de ISO/IEC 27001:2022 que el sistema debe satisfacer independientemente del rol que opere: integridad de la evidencia, protección de datos personales, trazabilidad auditable, rendimiento y disponibilidad. | ""\n(no aporta RF propios,\nsolo RNF) | RNF-01 a RNF-30\n(30 no funcionales,\nincluye RNF-04, 05, 08,\n13, 26, 27, 30 con\nrespaldo normativo\ndirecto - ver Matriz de\nTrazabilidad Normativa) | 30 | Pendiente de aprobación |
| | | | | | | | |
| RESUMEN Y RECONCILIACIÓN CON KPI-1.1 | | | | | | | |
| Total RF (empleado + verificador + administrador + transversal auth) | | | | 9 + 15 + 18 + 11 = 53 | | | |
| Total RNF (actor normativo) | | | | 30 | | | |
| Total de requerimientos en el universo de medición | | | | 53 + 30 = 83 | | | |
| Nota: esta matriz aún no ha sido revisada por la tutora. Una vez aprobada, se actualiza la columna "Estado de aprobación" y registrar la fecha en el acta correspondiente, tal como exige la fuente de datos de KPI-1.1 ("Matriz de Stakeholders aprobada por tutor (S2)"). | | | | | | | |
| Fuente: Elaborado por las autoras a partir del documento SRS v2 - Requerimientos del proyecto. | | | | | | | |