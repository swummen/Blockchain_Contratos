## Resumen
| Informe de resultados y defectos · TrazaDoc | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 | Unnamed: 4 |
| --- | --- | --- | --- | --- |
| Fuente de los resultados: Ciclo 1, entorno local (11 al 25 de octubre de 2026). Ciclo 2 en Azure pendiente. | NaN | NaN | NaN | NaN |
| NaN | NaN | NaN | NaN | NaN |
| 1. Ejecución | Valor | NaN | NaN | NaN |
| Casos planeados | 62 | NaN | NaN | NaN |
| Casos ejecutados | 50 | NaN | NaN | NaN |
| Aprobados (PASS) | 45 | NaN | NaN | NaN |
| Fallidos (FAIL) | 5 | NaN | NaN | NaN |
| Sin ejecutar | 12 | NaN | NaN | NaN |
| % de ejecución | 0.806452 | NaN | NaN | NaN |
| % de aprobación (PASS / ejecutados) | 0.9 | NaN | NaN | NaN |
| NaN | NaN | NaN | NaN | NaN |
| 2. Indicadores del OE4 | Resultado | Meta | Estado | NaN |
| Casos funcionales aprobados | 0.784314 | 0.9 | No cumple | Meta: al menos 46 de 51 casos |
| Detección de alteraciones (20 documentos) | 1 | 1 | Cumple | tests/integrity, 20/20 detectadas (25/10/2026) |
| Falsos positivos (originales marcados como alterados) | 0 | 0 | Cumple | tests/integrity (25/10/2026) |
| Latencia de verificación, percentil 95 (ms) | 2040 | 3000 | Cumple | tests/perf, ensayo del 15/10/2026 |
| NaN | NaN | NaN | NaN | NaN |
| 3. Defectos | Total | Abiertos | Cerrados | NaN |
| Crítica | 0 | 0 | 0 | NaN |
| Alta | 1 | 1 | 0 | NaN |
| Media | 3 | 3 | 0 | NaN |
| Baja | 2 | 2 | 0 | NaN |
| Total | 6 | 6 | 0 | NaN |
| NaN | NaN | NaN | NaN | NaN |
| 4. Resumen para el documento principal | NaN | NaN | NaN | NaN |
| Se ejecutaron 50 de 62 casos de prueba (81%): 45 aprobados y 5 fallidos, para una tasa de aprobación de 90%. | NaN | NaN | NaN | NaN |
| Casos funcionales: 78% aprobados frente a una meta de 90 % (No cumple). Integridad: 100% de alteraciones detectadas con 0 falsos positivos (Cumple). Latencia P95: 2040 ms frente a 3000 ms (Cumple). | NaN | NaN | NaN | NaN |
| Se registraron 6 defectos (críticos: 0, altos: 1, medios: 3, bajos: 2); 6 siguen abiertos. Ninguno impide registrar ni verificar documentos. | NaN | NaN | NaN | NaN |
| Los fallos se deben a dos requisitos aún sin implementar (aceptación de la política de datos y registro de intentos fallidos) y a un control de acceso de la API que deja ver datos de documentos ajenos. Las correcciones se priorizan por severidad y se vuelven a probar con regresión. | NaN | NaN | NaN | NaN |

## Resultados
| Resultados por módulo | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 | Unnamed: 4 | Unnamed: 5 |
| --- | --- | --- | --- | --- | --- |
| NaN | NaN | NaN | NaN | NaN | NaN |
| Módulo | Casos | PASS | FAIL | Sin ejecutar | % PASS de ejecutados |
| EP-01 Autenticación y control de acceso | 15 | 10 | 4 | 1 | 0.714286 |
| EP-02 Registro y gestión documental (Empleado) | 10 | 9 | 0 | 1 | 1 |
| EP-03 Verificación de integridad documental (Verificador) | 14 | 12 | 1 | 1 | 0.923077 |
| EP-04 Administración del sistema | 10 | 7 | 0 | 3 | 1 |
| EP-05 Infraestructura y despliegue | 2 | 2 | 0 | 0 | 1 |
| Transversal | 11 | 5 | 0 | 6 | 1 |
| Total | 62 | 45 | 5 | 12 | 0.9 |
| NaN | NaN | NaN | NaN | NaN | NaN |
| Casos fallidos | NaN | NaN | NaN | NaN | NaN |
| Caso | Descripción | NaN | NaN | NaN | Defecto |
| CP-11 | Registro de intentos fallidos | NaN | NaN | NaN | DEF-03 |
| CP-13 | Política de datos en el primer ingreso | NaN | NaN | NaN | DEF-04 |
| CP-14 | Aceptación de la política | NaN | NaN | NaN | DEF-04 |
| CP-15 | Acceso sin aceptar la política | NaN | NaN | NaN | DEF-04 |
| CP-29 | Empleado sin acceso a la huella ajena | NaN | NaN | NaN | DEF-06 |

## Defectos
| Defectos y acciones correctivas | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 | Unnamed: 4 | Unnamed: 5 | Unnamed: 6 | Unnamed: 7 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| NaN | NaN | NaN | NaN | NaN | NaN | NaN | NaN |
| ID | Defecto | Caso | Severidad | Prioridad | Estado | Acción correctiva | Responsable |
| DEF-01 | La lista de contratos del Verificador no se actualiza después de verificar | CP-35 | Baja | P3 Media | Nuevo | Recargar la lista de documentos después de cada verificación. | Laura Sofia Diaz Suarez |
| DEF-02 | "Reenviar código" no envía un código nuevo | CP-03 | Media | P2 Alta | Nuevo | Hacer que el botón vuelva a pedir el código al servidor. | Laura Sofia Diaz Suarez |
| DEF-03 | No se registran los intentos fallidos de inicio de sesión | CP-11 | Media | P2 Alta | Nuevo | Guardar cada intento fallido (correo, fecha, hora y motivo, sin la contraseña). | Sofia Ortiz Daza |
| DEF-04 | No existe la aceptación de la política de tratamiento de datos | CP-13 a CP-15 | Alta | P1 Urgente | Nuevo | Mostrar la política en el primer ingreso y guardar su aceptación con versión y fecha. | Sofia y Laura |
| DEF-05 | Los estados se muestran en minúscula | CP-22 | Baja | P4 Baja | Nuevo | Mostrar los estados con mayúscula inicial. | Laura Sofia Diaz Suarez |
| DEF-06 | Un Empleado puede consultar los datos de un documento ajeno | CP-29 | Media | P2 Alta | Nuevo | Negar el acceso (403) a documentos de otros empleados. | Sofia Ortiz Daza |

## Datos
| Datos de ejecución (fuente de las fórmulas) | Unnamed: 1 | Unnamed: 2 | Unnamed: 3 | Unnamed: 4 | Unnamed: 5 | Unnamed: 6 |
| --- | --- | --- | --- | --- | --- | --- |
| Copiados de docs/Pruebas\_QA\_QC\_TrazaDoc.xlsx (hoja Casos de prueba). Para actualizar tras el Ciclo 2, pegar en la columna F el estado del Ciclo 2. | NaN | NaN | NaN | NaN | NaN | NaN |
| NaN | NaN | NaN | NaN | NaN | NaN | NaN |
| ID | Tipo | Épica | Caso | Estado ciclo 1 | Estado ciclo 2 | Último resultado |
| CP-01 | Funcional | EP-01 Autenticación y control de acceso | Inicio de sesión con credenciales válidas | PASS | No ejecutado | PASS |
| CP-02 | Funcional | EP-01 Autenticación y control de acceso | Inicio de sesión con credenciales inválidas | PASS | No ejecutado | PASS |
| CP-03 | Funcional | EP-01 Autenticación y control de acceso | Código de verificación válido | PASS | No ejecutado | PASS |
| CP-04 | Funcional | EP-01 Autenticación y control de acceso | Acceso a un panel de otro rol | No ejecutado | No ejecutado | No ejecutado |
| CP-05 | Funcional | EP-01 Autenticación y control de acceso | Cierre de sesión | PASS | No ejecutado | PASS |
| CP-06 | Funcional | EP-01 Autenticación y control de acceso | Acceso después de cerrar sesión | PASS | No ejecutado | PASS |
| CP-07 | Funcional | EP-01 Autenticación y control de acceso | Cambio de contraseña correcto | PASS | No ejecutado | PASS |
| CP-08 | Funcional | EP-01 Autenticación y control de acceso | Cambio de contraseña con la actual errada | PASS | No ejecutado | PASS |
| CP-09 | Funcional | EP-01 Autenticación y control de acceso | Bloqueo tras 5 intentos fallidos | PASS | No ejecutado | PASS |
| CP-10 | Funcional | EP-01 Autenticación y control de acceso | Desbloqueo pasados 15 minutos | PASS | No ejecutado | PASS |
| CP-11 | Funcional | EP-01 Autenticación y control de acceso | Registro de intentos fallidos | FAIL | No ejecutado | FAIL |
| CP-12 | Funcional | EP-01 Autenticación y control de acceso | Cierre por inactividad | PASS | No ejecutado | PASS |
| CP-13 | Funcional | EP-01 Autenticación y control de acceso | Política de datos en el primer ingreso | FAIL | No ejecutado | FAIL |
| CP-14 | Funcional | EP-01 Autenticación y control de acceso | Aceptación de la política | FAIL | No ejecutado | FAIL |
| CP-15 | Funcional | EP-01 Autenticación y control de acceso | Acceso sin aceptar la política | FAIL | No ejecutado | FAIL |
| CP-16 | Funcional | EP-02 Registro y gestión documental (Empleado) | Carga de un PDF válido de 10 MB | No ejecutado | No ejecutado | No ejecutado |
| CP-17 | Funcional | EP-02 Registro y gestión documental (Empleado) | Rechazo de DOCX o PDF de 25 MB | PASS | No ejecutado | PASS |
| CP-18 | Funcional | EP-02 Registro y gestión documental (Empleado) | Metadatos y huella automáticos | PASS | No ejecutado | PASS |
| CP-19 | Funcional | EP-02 Registro y gestión documental (Empleado) | La huella no cambia para el mismo contenido | PASS | No ejecutado | PASS |
| CP-20 | Funcional | EP-02 Registro y gestión documental (Empleado) | Registro en la blockchain con txID | PASS | No ejecutado | PASS |
| CP-21 | Funcional | EP-02 Registro y gestión documental (Empleado) | Falla de la red blockchain | PASS | No ejecutado | PASS |
| CP-22 | Funcional | EP-02 Registro y gestión documental (Empleado) | Mis documentos muestra solo los propios | PASS | No ejecutado | PASS |
| CP-23 | Funcional | EP-02 Registro y gestión documental (Empleado) | Estado inicial Pendiente | PASS | No ejecutado | PASS |
| CP-24 | Funcional | EP-02 Registro y gestión documental (Empleado) | Trazabilidad de mis documentos | PASS | No ejecutado | PASS |
| CP-25 | Funcional | EP-02 Registro y gestión documental (Empleado) | Trazabilidad de un documento ajeno | PASS | No ejecutado | PASS |
| CP-26 | Funcional | EP-03 Verificación de integridad documental (Verificador) | Selección de un documento registrado | PASS | No ejecutado | PASS |
| CP-27 | Funcional | EP-03 Verificación de integridad documental (Verificador) | Identificador inexistente | PASS | No ejecutado | PASS |
| CP-28 | Funcional | EP-03 Verificación de integridad documental (Verificador) | Huella completa para el Verificador | PASS | No ejecutado | PASS |
| CP-29 | Funcional | EP-03 Verificación de integridad documental (Verificador) | Empleado sin acceso a la huella ajena | FAIL | No ejecutado | FAIL |
| CP-30 | Funcional | EP-03 Verificación de integridad documental (Verificador) | Carga del archivo a comparar | PASS | No ejecutado | PASS |
| CP-31 | Funcional | EP-03 Verificación de integridad documental (Verificador) | Archivo a comparar de 30 MB | No ejecutado | No ejecutado | No ejecutado |
| CP-32 | Funcional | EP-03 Verificación de integridad documental (Verificador) | Huellas idénticas | PASS | No ejecutado | PASS |
| CP-33 | Funcional | EP-03 Verificación de integridad documental (Verificador) | Huellas distintas | PASS | No ejecutado | PASS |
| CP-34 | Funcional | EP-03 Verificación de integridad documental (Verificador) | Estado Verificado y evento en el ledger | PASS | No ejecutado | PASS |
| CP-35 | Funcional | EP-03 Verificación de integridad documental (Verificador) | Nueva verificación | PASS | No ejecutado | PASS |
| CP-36 | Funcional | EP-03 Verificación de integridad documental (Verificador) | Listado general de documentos | PASS | No ejecutado | PASS |
| CP-37 | Funcional | EP-03 Verificación de integridad documental (Verificador) | Huella restringida para roles no autorizados | PASS | No ejecutado | PASS |
| CP-38 | Funcional | EP-03 Verificación de integridad documental (Verificador) | Trazabilidad global | PASS | No ejecutado | PASS |
| CP-39 | Funcional | EP-03 Verificación de integridad documental (Verificador) | Campos de la trazabilidad global | PASS | No ejecutado | PASS |
| CP-40 | Funcional | EP-04 Administración del sistema | Panel con los cuatro totales | PASS | No ejecutado | PASS |
| CP-41 | Funcional | EP-04 Administración del sistema | La suma de estados coincide con el total | PASS | No ejecutado | PASS |
| CP-42 | Funcional | EP-04 Administración del sistema | Creación de usuario | PASS | No ejecutado | PASS |
| CP-43 | Funcional | EP-04 Administración del sistema | Desactivación conserva el historial | No ejecutado | No ejecutado | No ejecutado |
| CP-44 | Funcional | EP-04 Administración del sistema | Listado administrativo de documentos | PASS | No ejecutado | PASS |
| CP-45 | Funcional | EP-04 Administración del sistema | Mismos campos que el Verificador | PASS | No ejecutado | PASS |
| CP-46 | Funcional | EP-04 Administración del sistema | Trazabilidad administrativa | PASS | No ejecutado | PASS |
| CP-47 | Funcional | EP-04 Administración del sistema | Detalle igual o mayor que el Verificador | PASS | No ejecutado | PASS |
| CP-48 | Funcional | EP-04 Administración del sistema | Cambio de rol | No ejecutado | No ejecutado | No ejecutado |
| CP-49 | Funcional | EP-04 Administración del sistema | Desactivación (edición de usuarios) | No ejecutado | No ejecutado | No ejecutado |
| CP-50 | Funcional | EP-05 Infraestructura y despliegue | Todo el sistema arranca en contenedores | PASS | No ejecutado | PASS |
| CP-51 | Funcional | EP-05 Infraestructura y despliegue | El frontend no habla con la blockchain | PASS | No ejecutado | PASS |
| INT-01 | Integridad | Transversal | Mutación documental de los 20 documentos sintéticos | PASS | No ejecutado | PASS |
| INT-02 | Integridad | Transversal | Alteración de texto en la interfaz | PASS | No ejecutado | PASS |
| INT-03 | Integridad | Transversal | Alteración de firma en la interfaz | No ejecutado | No ejecutado | No ejecutado |
| INT-04 | Integridad | Transversal | Alteración solo de metadatos | No ejecutado | No ejecutado | No ejecutado |
| INT-05 | Integridad | Transversal | Cambio de un solo carácter | No ejecutado | No ejecutado | No ejecutado |
| INT-06 | Integridad | Transversal | Anexo agregado | No ejecutado | No ejecutado | No ejecutado |
| TRZ-01 | Trazabilidad | Transversal | Orden cronológico del historial | PASS | No ejecutado | PASS |
| TRZ-02 | Trazabilidad | Transversal | Inmutabilidad del registro | No ejecutado | No ejecutado | No ejecutado |
| TRZ-03 | Trazabilidad | Transversal | Consistencia entre la blockchain y la base de datos | No ejecutado | No ejecutado | No ejecutado |
| REN-01 | Rendimiento | Transversal | Latencia de la verificación | PASS | No ejecutado | PASS |
| REN-02 | Rendimiento | Transversal | Latencia de la escritura del hash | PASS | No ejecutado | PASS |
