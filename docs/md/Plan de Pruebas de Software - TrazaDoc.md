**Plan de Pruebas de Software (PPS)**

**TrazaDoc**

MVP de un sistema web para la verificación de integridad y trazabilidad documental en contratos laborales mediante blockchain permisionada

Laura Sofia Diaz Suarez

Sofia Ortiz Daza

Director: Juan Carlos Navarro Beltrán

Codirectora: Solangie Paola Garavito Mendivelso

Universidad Católica de Colombia

Facultad de Ingeniería · Programa de Ingeniería de Sistemas y Computación

Bogotá D.C., octubre de 2026

**Control de versiones**

| **Versión** | **Fecha** | **Autoras** | **Descripción del cambio** |
| --- | --- | --- | --- |
| 1.0 | 25/10/2026 | Laura Sofia Diaz Suarez, Sofia Ortiz Daza | Primera versión del plan: alcance, estrategia, entornos, casos de prueba y cronograma de la Fase 4 (OE4). |

**Contenido**

[1. Objetivo 4](#_Toc243846502)

[1.1 A quién va dirigido 4](#_Toc243846503)

[1.2 Qué es TrazaDoc 4](#_Toc243846504)

[1.3 Objetivos de la prueba 4](#_Toc243846505)

[1.4 Tecnologías del sistema bajo prueba 5](#_Toc243846506)

[2. Alcance 6](#_Toc243846507)

[2.1 Inclusiones 7](#_Toc243846508)

[2.2 Exclusiones 16](#_Toc243846509)

[3. Entornos de prueba 17](#_Toc243846510)

[3.1 Características de cada entorno 17](#_Toc243846511)

[3.2 Navegadores y dispositivos 17](#_Toc243846512)

[3.3 Usuarios y permisos de prueba 17](#_Toc243846513)

[3.4 Datos de prueba 18](#_Toc243846514)

[4. Procedimiento de reporte de defectos 19](#_Toc243846515)

[4.1 Pasos para reportar un defecto 19](#_Toc243846516)

[4.2 Clasificación y priorización 19](#_Toc243846517)

[4.3 Responsables por área 20](#_Toc243846518)

[4.4 Registro inicial de defectos 20](#_Toc243846519)

[5. Estrategia de pruebas 22](#_Toc243846520)

[5.1 Paso 1: diseño de escenarios y casos de prueba 22](#_Toc243846521)

[5.2 Paso 2: procedimiento al recibir una versión para probar 23](#_Toc243846522)

[5.3 Tipos de prueba 23](#_Toc243846523)

[5.4 Paso 3: buenas prácticas 24](#_Toc243846524)

[6. Cronograma de pruebas 25](#_Toc243846525)

[7. Entregables de prueba 26](#_Toc243846526)

[8. Criterios de entrada y salida 27](#_Toc243846527)

[8.1 Análisis de requerimientos 27](#_Toc243846528)

[8.2 Ejecución de pruebas 27](#_Toc243846529)

[8.3 Cierre de pruebas 28](#_Toc243846530)

[9. Herramientas 28](#_Toc243846531)

[10. Riesgos y mitigaciones 28](#_Toc243846532)

[11. Aprobaciones 29](#_Toc243846533)

[Anexo A. Catálogo de casos de prueba 30](#_Toc243846534)

[A.1 EP-01 Autenticación y control de acceso 30](#_Toc243846535)

[A.2 EP-02 Registro y gestión documental (Empleado) 32](#_Toc243846536)

[A.3 EP-03 Verificación de integridad documental (Verificador) 33](#_Toc243846537)

[A.4 EP-04 Administración del sistema 34](#_Toc243846538)

[A.5 EP-05 Infraestructura y despliegue 35](#_Toc243846539)

[A.6 Casos de integridad, trazabilidad y rendimiento 35](#_Toc243846540)

# 1. Objetivo

Este documento es el **Plan de Pruebas de Software (PPS)** de TrazaDoc, el MVP desarrollado en el trabajo de grado. Responde al **objetivo específico 4 (OE4)**:

**"Evaluar el MVP mediante un plan de pruebas que verifique el comportamiento funcional de los módulos, la detección de alteraciones en documentos registrados y el rendimiento operativo del sistema."**

Su propósito es definir, antes de ejecutar cualquier prueba, **qué se va a probar, cómo, dónde, quién lo hace, cuándo y con qué criterio se decide si el sistema pasa o no**. Así, los resultados que se presenten en el informe final se pueden repetir y comprobar.

## 1.1 A quién va dirigido

Este documento está escrito para **cualquier persona interesada** en TrazaDoc: el equipo del proyecto, el director y la codirectora, los jurados, otros estudiantes o desarrolladores que quieran repetir las pruebas, y empresas que evalúen una solución parecida. No hace falta saber de blockchain ni de programación: cada término técnico se explica la primera vez que aparece, y cada prueba dice paso a paso qué se hace y qué se espera ver.

## 1.2 Qué es TrazaDoc

TrazaDoc permite a una empresa proteger sus contratos laborales y acuerdos de confidencialidad en PDF. Cuando un Empleado carga un documento, el sistema calcula su **huella digital (hash SHA-256)**, una especie de "código único" del archivo: si al documento se le cambia aunque sea una coma, la huella cambia por completo. Esa huella se guarda en una **red blockchain permisionada (Hyperledger Fabric)**, donde nadie puede modificarla ni borrarla. Después, un Verificador puede comprobar si una copia del documento es idéntica a la registrada, y el Administrador puede consultar todo el historial.

El sistema tiene tres roles:

* **Empleado:** carga sus documentos, consulta su estado y su historial.
* **Verificador:** compara una copia de un documento contra la huella registrada y consulta el historial de todos los documentos.
* **Administrador:** ve el resumen del sistema, gestiona los usuarios y consulta documentos y trazabilidad.

## 1.3 Objetivos de la prueba

* Comprobar que cada función del sistema se comporta como lo definen las 24 historias de usuario y sus 51 escenarios de aceptación.
* Demostrar que el sistema detecta el **100 %** de las alteraciones sobre 20 documentos sintéticos, sin marcar como alterado ningún documento original.
* Comprobar que el historial guardado en la blockchain coincide, en orden y contenido, con las acciones realizadas (no repudio).
* Medir los tiempos de respuesta al registrar y al verificar un documento.
* Encontrar, registrar y hacer seguimiento a los defectos hasta su cierre.

## 1.4 Tecnologías del sistema bajo prueba

* Frontend: React 19, Vite y TypeScript, servido por nginx.
* Backend: Node.js 20 con Express y TypeScript.
* Blockchain: Hyperledger Fabric 2.5.16 (2 organizaciones, 1 orderer, 3 autoridades certificadoras, canal contratoschannel).
* Contrato inteligente (chaincode): Go.
* Base de datos: MongoDB 7.
* Autenticación: contraseña + código de 6 dígitos enviado por correo (Brevo) y sesión con JWT.
* Infraestructura: Docker y Docker Compose; en el entorno de validación, Caddy para HTTPS.

# 2. Alcance

El alcance de las pruebas cubre los siguientes aspectos:

**Funcionalidades que se prueban.** Las cinco épicas del backlog: autenticación y control de acceso, registro y gestión documental, verificación de integridad, administración del sistema e infraestructura. En total, 24 historias de usuario y 51 escenarios de aceptación (sección 2.1).

**Tipos de prueba.** Pruebas funcionales de caja negra (manuales y automatizadas), pruebas de integridad por mutación documental, pruebas de trazabilidad e inmutabilidad, pruebas de rendimiento, pruebas de humo, de regresión y de usabilidad (sección 5).

**Entornos.** Un entorno de desarrollo local para ensayos y un entorno de validación en una máquina virtual de Microsoft Azure, donde se hace la ejecución oficial (sección 3).

**Criterios de éxito.** Los indicadores (KPI) del OE4 definidos en el trabajo de grado:

**Tabla 1.** Indicadores de éxito de las pruebas

| **Indicador (KPI)** | **Meta** |
| --- | --- |
| Tasa de detección de alteraciones documentales | 100 % de los 20 documentos alterados detectados como no íntegros |
| Porcentaje de casos de prueba funcionales con resultado PASS | 90 % o más en la suite final (al menos 46 de los 51 casos) |
| Porcentaje de ejecución del PPS completado en plazo | 85 % o más de las actividades cerradas al cierre de S15 (al menos 17 de 20) |
| Latencia de la verificación (KPI de OE3, se vuelve a medir aquí) | Percentil 95 menor o igual a 3000 ms en 50 peticiones consecutivas |

*Fuente: elaboración propia a partir de la Tabla 1 del trabajo de grado.*

**Roles y responsabilidades.**

**Tabla 2.** Roles y responsabilidades del equipo de pruebas

| **Rol** | **Persona** | **Responsabilidades** |
| --- | --- | --- |
| Líder de pruebas | Sofia Ortiz Daza | Redactar y mantener este plan; coordinar la ejecución; consolidar resultados, defectos e informe final. |
| Analista de pruebas | Laura Sofia Diaz Suarez | Diseñar y ejecutar los casos de interfaz y usabilidad; tomar las capturas de evidencia; reportar defectos; redactar la documentación de pruebas (informe de resultados, matriz de cumplimiento y manual de usuario). |
| Analista de pruebas | Sofia Ortiz Daza | Ejecutar los casos de backend, blockchain, infraestructura, integridad, trazabilidad y rendimiento; correr las pruebas automatizadas; desplegar y mantener los entornos. |
| Desarrolladoras | Laura Sofia Diaz Suarez (interfaz y usabilidad), Sofia Ortiz Daza (backend, chaincode, infraestructura y despliegue) | Corregir los defectos asignados y avisar cuando estén listos para volver a probar. |
| Aprobación | Juan Carlos Navarro Beltrán (director), Solangie Paola Garavito Mendivelso (codirectora) | Revisar y aprobar el plan, los casos y el informe final. |

*Fuente: elaboración propia.*

**Cronograma.** Dos semanas de pruebas locales (11 al 24 de octubre de 2026), despliegue en Azure el 25 de octubre y pruebas sobre el despliegue del 25 al 29 de octubre (sección 6).

**Herramientas.** Pruebas automatizadas del proyecto, navegador, Postman, GitHub Issues y documentos de Word y Excel (sección 9).

## 2.1 Inclusiones

**Introducción.** Se prueba el sistema completo, tal como lo usa una persona: desde el navegador, pasando por el backend, hasta la red blockchain y la base de datos. Cada historia de usuario tiene al menos dos escenarios de aceptación (uno principal y uno alterno o de error) y cada escenario se convierte en un caso de prueba (Anexo A).

**Objetivos de la prueba.** Encontrar defectos antes de la entrega, confirmar que se cumplen los requerimientos y medir los indicadores del OE4.

Módulos y pantallas incluidos:

**Tabla 3.** Módulos incluidos en las pruebas

| **Épica (módulo)** | **Historias de usuario** | **Pantallas o elementos** | **Casos** |
| --- | --- | --- | --- |
| EP-01 Autenticación y control de acceso | HU-001 a HU-004, HU-022, HU-023 | Inicio de sesión, código de verificación, cierre de sesión, cambio de contraseña, bloqueo e inactividad, política de datos | CP-01 a CP-15 |
| EP-02 Registro y gestión documental | HU-005 a HU-009 | Cargar documento, Mis documentos, Mi trazabilidad | CP-16 a CP-25 |
| EP-03 Verificación de integridad | HU-010 a HU-016 | Verificar integridad, Documentos, Trazabilidad global | CP-26 a CP-39 |
| EP-04 Administración del sistema | HU-017 a HU-020, HU-024 | Dashboard, Usuarios, Documentos, Trazabilidad | CP-40 a CP-49 |
| EP-05 Infraestructura y despliegue | HU-021 | Contenedores Docker, red Fabric, aislamiento del frontend | CP-50 a CP-51 |

*Fuente: elaboración propia.*

A continuación se muestran las pantallas que se van a probar, capturadas del sistema en funcionamiento:

### Acceso al sistema (todos los roles)

![Página de inicio pública.](data:image/jpeg;base64...)

**Figura 1.** Página de inicio pública.

*Fuente: captura del sistema en ejecución, 25 de octubre de 2026.*

![Inicio de sesión con correo y contraseña (casos CP-01 y CP-02).](data:image/jpeg;base64...)

**Figura 2.** Inicio de sesión con correo y contraseña (casos CP-01 y CP-02).

*Fuente: captura del sistema en ejecución, 25 de octubre de 2026.*

![Código de verificación de 6 dígitos enviado al correo (caso CP-03).](data:image/jpeg;base64...)

**Figura 3.** Código de verificación de 6 dígitos enviado al correo (caso CP-03).

*Fuente: captura del sistema en ejecución, 25 de octubre de 2026.*

### Rol Empleado

![Cargar documento: resultado del registro con identificador y huella enmascarada (casos CP-16 a CP-20).](data:image/jpeg;base64...)

**Figura 4.** Cargar documento: resultado del registro con identificador y huella enmascarada (casos CP-16 a CP-20).

*Fuente: captura del sistema en ejecución, 25 de octubre de 2026.*

![Mis documentos: solo los documentos propios con su estado (casos CP-22 y CP-23).](data:image/jpeg;base64...)

**Figura 5.** Mis documentos: solo los documentos propios con su estado (casos CP-22 y CP-23).

*Fuente: captura del sistema en ejecución, 25 de octubre de 2026.*

![Mi trazabilidad: historial con carga, verificaciones y su TX (caso CP-24).](data:image/jpeg;base64...)

**Figura 6.** Mi trazabilidad: historial con carga, verificaciones y su TX (caso CP-24).

*Fuente: captura del sistema en ejecución, 25 de octubre de 2026.*

### Rol Verificador

![Selección del documento en dos pasos: persona responsable y contrato (caso CP-26).](data:image/jpeg;base64...)

**Figura 7.** Selección del documento en dos pasos: persona responsable y contrato (caso CP-26).

*Fuente: captura del sistema en ejecución, 25 de octubre de 2026.*

![Documento seleccionado con su huella completa y archivo cargado para comparar (casos CP-28 y CP-30).](data:image/jpeg;base64...)

**Figura 8.** Documento seleccionado con su huella completa y archivo cargado para comparar (casos CP-28 y CP-30).

*Fuente: captura del sistema en ejecución, 25 de octubre de 2026.*

![Resultado: integridad confirmada, huellas idénticas (caso CP-32).](data:image/jpeg;base64...)

**Figura 9.** Resultado: integridad confirmada, huellas idénticas (caso CP-32).

*Fuente: captura del sistema en ejecución, 25 de octubre de 2026.*

![Resultado: integridad comprometida, se muestran las dos huellas (caso CP-33).](data:image/jpeg;base64...)

**Figura 10.** Resultado: integridad comprometida, se muestran las dos huellas (caso CP-33).

*Fuente: captura del sistema en ejecución, 25 de octubre de 2026.*

![Todos los documentos, con huella completa para el Verificador (caso CP-36).](data:image/jpeg;base64...)

**Figura 11.** Todos los documentos, con huella completa para el Verificador (caso CP-36).

*Fuente: captura del sistema en ejecución, 25 de octubre de 2026.*

![Trazabilidad global con documento, acción, usuario, TX ID, fecha y resultado (casos CP-38 y CP-39).](data:image/jpeg;base64...)

**Figura 12.** Trazabilidad global con documento, acción, usuario, TX ID, fecha y resultado (casos CP-38 y CP-39).

*Fuente: captura del sistema en ejecución, 25 de octubre de 2026.*

### Rol Administrador

![Dashboard con los cuatro totales y la actividad reciente (casos CP-40 y CP-41).](data:image/jpeg;base64...)

**Figura 13.** Dashboard con los cuatro totales y la actividad reciente (casos CP-40 y CP-41).

*Fuente: captura del sistema en ejecución, 25 de octubre de 2026.*

![Gestión de usuarios con rol y estado (casos CP-42, CP-43, CP-48 y CP-49).](data:image/jpeg;base64...)

**Figura 14.** Gestión de usuarios con rol y estado (casos CP-42, CP-43, CP-48 y CP-49).

*Fuente: captura del sistema en ejecución, 25 de octubre de 2026.*

![Formulario de creación de usuario (caso CP-42).](data:image/jpeg;base64...)

**Figura 15.** Formulario de creación de usuario (caso CP-42).

*Fuente: captura del sistema en ejecución, 25 de octubre de 2026.*

![Documentos registrados, con la huella enmascarada para el Administrador (casos CP-44 y CP-45).](data:image/jpeg;base64...)

**Figura 16.** Documentos registrados, con la huella enmascarada para el Administrador (casos CP-44 y CP-45).

*Fuente: captura del sistema en ejecución, 25 de octubre de 2026.*

![Historial de trazabilidad del Administrador (casos CP-46 y CP-47).](data:image/jpeg;base64...)

**Figura 17.** Historial de trazabilidad del Administrador (casos CP-46 y CP-47).

*Fuente: captura del sistema en ejecución, 25 de octubre de 2026.*

## 2.2 Exclusiones

Quedan fuera de estas pruebas, porque están fuera del alcance del MVP declarado en el trabajo de grado (numerales 2.6.1 y 2.6.2):

1. Firma electrónica o digital avanzada con validez jurídica plena (PKI). El sistema complementa la firma, no la reemplaza.
2. Cargas masivas o por lotes y pruebas de carga o estrés a escala empresarial.
3. Archivos distintos a PDF (DOCX, XML o imágenes): solo se prueba que el sistema los rechace.
4. Uso en la infraestructura productiva de la empresa o con datos reales: todas las pruebas usan datos ficticios.
5. Certificación ISO/IEC 27001 o auditorías de cumplimiento normativo.
6. Aplicaciones móviles nativas: el sistema es web; en celular solo se hace una revisión visual básica.
7. Prevención de copias, reenvíos o impresiones del documento antes de su registro.
8. Recuperación de contraseña por correo, que no hace parte de los requerimientos.

# 3. Entornos de prueba

Se usan dos entornos con el mismo software y la misma configuración. El local sirve para ensayar y para las pruebas que exigen apagar componentes; el de Azure es donde se hace la **ejecución oficial**, cuyos resultados van al informe.

**Tabla 4.** Entornos de prueba

| **Nombre** | **Dirección (URL)** | **Uso** |
| --- | --- | --- |
| Desarrollo local | http://localhost:5173 | Ensayos previos, pruebas automatizadas, casos que requieren detener la red blockchain (CP-21) y medición de rendimiento sobre Docker local (KPI de OE3). |
| Validación (Azure) | https://trazadoc-tesis.eastus2.cloudapp.azure.com | Ejecución oficial de los casos funcionales, de integridad y de trazabilidad. Disponible durante un mes, según el alcance del trabajo de grado. |

*Fuente: elaboración propia.*

## 3.1 Características de cada entorno

**Tabla 5.** Características técnicas de los entornos

| **Aspecto** | **Desarrollo local** | **Validación (Azure)** |
| --- | --- | --- |
| Sistema operativo | Windows 11 Pro con Docker Desktop 28.5 | Ubuntu Server 24.04 LTS con Docker Engine |
| Equipo | AMD Ryzen 5 7600X (12 hilos), 31 GB de RAM | Máquina virtual Standard\_B2s: 2 vCPU, 4 GB de RAM, disco SSD de 30 GB |
| Red | Conexión cableada o Wi-Fi del equipo | Internet público; solo los puertos 80 y 443 abiertos (y 22 para administración, limitado a la IP del equipo) |
| Seguridad de acceso | HTTP en localhost | HTTPS con certificado Let's Encrypt (Caddy), límite de intentos de inicio de sesión por IP |
| Versiones | La misma versión del repositorio en ambos entornos (se identifica por el commit de Git anotado en el informe) |  |

*Fuente: elaboración propia.*

## 3.2 Navegadores y dispositivos

* Windows 11: Google Chrome, Microsoft Edge y Mozilla Firefox, en sus versiones estables vigentes.
* Android: Google Chrome (revisión visual básica de las pantallas, sin casos completos).
* Resolución de referencia: 1440 × 900 píxeles en computador.

## 3.3 Usuarios y permisos de prueba

Cada rol tiene su usuario de prueba. Todos los correos llegan al mismo buzón del proyecto (contratosblockchain@gmail.com), lo que permite recibir los códigos de verificación de todos los roles en un solo lugar.

**Tabla 6.** Usuarios de prueba

| **Rol** | **Usuario** | **Correo** |
| --- | --- | --- |
| Empleado | María López | contratosblockchain+empleado@gmail.com |
| Empleado (segundo) | Carlos Ruiz | contratosblockchain+empleado2@gmail.com |
| Verificador | Pedro Gómez | contratosblockchain+verificador@gmail.com |
| Administrador | Laura Diaz | contratosblockchain+admin@gmail.com |

*Fuente: elaboración propia. Las contraseñas del entorno de Azure se entregan aparte y no se escriben en este documento.*

## 3.4 Datos de prueba

* **20 documentos sintéticos** (12 contratos laborales y 8 acuerdos de confidencialidad) con datos ficticios, y una copia alterada de cada uno, en la carpeta docs/documentos-prueba del repositorio. Las alteraciones son de cinco tipos: texto, firma, metadatos, un solo carácter y anexo agregado (4 documentos de cada tipo).
* Archivos para los casos de límite: PDF de 10 MB, de 25 MB y de 30 MB, un archivo DOCX y un archivo de texto con extensión .pdf.
* Ningún documento contiene información real de la empresa ni de personas.

# 4. Procedimiento de reporte de defectos

Un **defecto** es cualquier diferencia entre lo que hace el sistema y lo que dice el resultado esperado de un caso de prueba, un requerimiento o una historia de usuario. También se reportan problemas de uso (por ejemplo, un mensaje confuso) y errores técnicos (por ejemplo, una pantalla que no carga).

## 4.1 Pasos para reportar un defecto

1. Repetir el problema al menos una vez para confirmar que no fue casual.
2. Crear el reporte en GitHub Issues del repositorio con la etiqueta "defecto" y la de su severidad.
3. Llenar todos los campos de la plantilla (Tabla 7).
4. Adjuntar la evidencia: captura de pantalla y, si aplica, el mensaje de error o el registro del backend.
5. Asignarlo a la responsable del área (Tabla 9) y avisar por el canal del equipo.

**Tabla 7.** Campos del reporte de defecto

| **Campo** | **Qué se escribe** |
| --- | --- |
| Identificador | DEF-XX, consecutivo. |
| Título | Frase corta que describe el problema. |
| Caso de prueba | El caso donde apareció (por ejemplo, CP-33). |
| Entorno | Local o Azure, navegador y versión del sistema (commit). |
| Pasos para reproducirlo | Lista numerada desde el inicio de sesión. |
| Resultado esperado y obtenido | Lo que debía pasar y lo que pasó. |
| Severidad y prioridad | Según la Tabla 8. |
| Evidencia | Capturas, mensajes o registros. |
| Estado | Nuevo, Asignado, En corrección, Corregido, Re-probado, Cerrado o Rechazado. |

*Fuente: elaboración propia.*

## 4.2 Clasificación y priorización

**Tabla 8.** Niveles de severidad

| **Severidad** | **Significado** | **Ejemplo en TrazaDoc** | **Tiempo objetivo de corrección** |
| --- | --- | --- | --- |
| Crítica | Impide usar una función principal o compromete la integridad o la seguridad. | Un documento alterado sale como "Integridad confirmada"; un Empleado ve documentos ajenos. | Inmediato; se detiene la ejecución hasta corregirlo. |
| Alta | Una función importante falla, pero hay forma de seguir probando. | La carga de documentos falla con PDF válidos. | 2 días |
| Media | Falla una función secundaria o falta una parte de un requerimiento. | El botón Reenviar código no envía un código nuevo. | 5 días |
| Baja | Detalle visual o de redacción que no afecta el uso. | Un estado escrito en minúscula. | Antes del cierre, si hay tiempo. |

*Fuente: elaboración propia.*

La **prioridad** indica el orden de corrección y la define la líder de pruebas con las desarrolladoras: primero lo que bloquea casos pendientes de ejecutar, luego lo que afecta los KPI y al final lo cosmético.

## 4.3 Responsables por área

**Tabla 9.** Responsables de atender defectos

| **Área del defecto** | **Responsable** |
| --- | --- |
| Interfaz (frontend) y usabilidad | Laura Sofia Diaz Suarez |
| Documentación de pruebas | Laura Sofia Diaz Suarez |
| Backend y API | Sofia Ortiz Daza |
| Blockchain (chaincode y red Fabric) | Sofia Ortiz Daza |
| Infraestructura (Docker y Azure) | Sofia Ortiz Daza |

*Fuente: elaboración propia.*

**Herramienta:** GitHub Issues del repositorio del proyecto.

**Comunicación:** al final de cada día de ejecución se comparte en el canal del equipo un resumen de los casos ejecutados y los defectos nuevos; al cierre de la ejecución se comparte el resumen con el director y la codirectora.

**Métricas del proceso:** número de defectos por severidad y por módulo, tiempo promedio de corrección, porcentaje de defectos corregidos y porcentaje de defectos reabiertos.

## 4.4 Registro inicial de defectos

Durante la preparación de este plan, al revisar el sistema y tomar las capturas, se identificaron los siguientes defectos. Quedan registrados desde ya para hacerles seguimiento durante la ejecución:

**Tabla 10.** Defectos identificados durante la preparación

| **ID** | **Descripción** | **Caso** | **Severidad** | **Estado** |
| --- | --- | --- | --- | --- |
| DEF-01 | En Verificar integridad, después de una verificación, la lista de contratos sigue mostrando el estado anterior (por ejemplo, "Pendiente" en un documento ya verificado) hasta recargar la página. | CP-35 | Baja | Nuevo |
| DEF-02 | El botón "Reenviar código" solo borra los campos del código; no envía un código nuevo al correo. | CP-03 | Media | Nuevo |
| DEF-03 | No se registran los intentos fallidos de inicio de sesión (correo, fecha, hora y motivo), como pide HU-022 CA-03. | CP-11 | Media | Nuevo |
| DEF-04 | No está implementada la aceptación de la política de tratamiento de datos en el primer ingreso (HU-023, RF-055, Ley 1581 de 2012). | CP-13 a CP-15 | Alta | Nuevo |
| DEF-05 | Las insignias de estado aparecen en minúscula ("pendiente", "alterado"), distinto de como se nombran en el resto del sistema. | CP-22 | Baja | Nuevo |

*Fuente: elaboración propia.*

# 5. Estrategia de pruebas

## 5.1 Paso 1: diseño de escenarios y casos de prueba

Los casos se construyen a partir de los **51 escenarios de aceptación** (formato Dado / Cuando / Entonces) de las 24 historias de usuario: un caso por escenario. Además se agregan casos de integridad, trazabilidad y rendimiento (Anexo A). Para diseñarlos se usan estas técnicas:

* **Partición de equivalencia:** se agrupan las entradas que el sistema debe tratar igual y se prueba una de cada grupo. Ejemplo: archivo PDF válido, archivo que no es PDF, PDF dañado.
* **Análisis de valores límite:** se prueba justo en el borde de cada regla. Ejemplos: un PDF de 20 MB y uno de 20 MB más 1 byte; el quinto y el sexto intento fallido; una contraseña de 7 y de 8 caracteres; el código vencido a los 5 minutos; la sesión inactiva a los 15 minutos.
* **Tabla de decisión:** se cruza cada rol con cada acción para comprobar que solo se permite lo debido (Tabla 11).
* **Transición de estados:** se recorren los cambios de estado. Documento: Pendiente → Verificado o Alterado. Usuario: Activo → Bloqueado temporalmente → Activo, y Activo → Inactivo.
* **Casos de uso:** se siguen los flujos completos de cada historia de usuario.

Además se aplica la experiencia del equipo:

* **Adivinación de errores:** situaciones que suelen fallar, como subir dos veces el mismo PDF, hacer doble clic en Cargar, recargar la página con la sesión abierta o quedarse sin red a mitad de una carga.
* **Pruebas exploratorias:** sesiones libres de 30 minutos por rol, anotando lo que se encuentre.

**Tabla 11.** Tabla de decisión: permisos por rol

| **Acción** | **Empleado** | **Verificador** | **Administrador** |
| --- | --- | --- | --- |
| Cargar un documento | Sí | No | No |
| Ver sus propios documentos y su trazabilidad | Sí | N/A | N/A |
| Ver documentos y trazabilidad de otros | No | Sí | Sí |
| Ver la huella SHA-256 completa | No (enmascarada) | Sí | No (enmascarada) |
| Verificar la integridad de un documento | No | Sí | No |
| Ver el panel con los totales | No | No | Sí |
| Crear, editar y desactivar usuarios | No | No | Sí |

*Fuente: elaboración propia.*

Los casos se **priorizan** en Alta, Media y Baja según el riesgo: primero lo relacionado con integridad, seguridad y permisos; luego las consultas; al final lo visual.

## 5.2 Paso 2: procedimiento al recibir una versión para probar

1. **Prueba de humo:** antes de todo se ejecuta el script docker/smoke-test.sh (comprueba la red blockchain, el registro y la consulta de un documento) y se inicia sesión con los tres roles.
2. Si la prueba de humo falla, **se rechaza la versión** y se espera una corregida antes de seguir.
3. Si pasa, se ejecutan **a fondo** los casos del Anexo A, en orden de prioridad, anotando el resultado de cada uno.
4. Los defectos se reportan apenas se encuentran (sección 4), y al final del día se envía el resumen.
5. Cuando se corrige un defecto, se **vuelve a probar** el caso donde apareció y se repiten las pruebas automatizadas para confirmar que no se dañó nada más (regresión).

Se planean tres **ciclos de prueba**:

**Tabla 12.** Ciclos de prueba

| **Ciclo** | **Entorno** | **Propósito** |
| --- | --- | --- |
| Ciclo 1: ensayo | Desarrollo local | Comprobar que los casos, los datos y los scripts funcionan; corregir el plan si hace falta. |
| Ciclo 2: ejecución oficial | Validación (Azure) | Ejecutar todos los casos y medir los KPI. Sus resultados van al informe. |
| Ciclo 3: re-pruebas | Validación (Azure) | Volver a probar los casos con defectos corregidos y repetir la regresión. |

*Fuente: elaboración propia.*

## 5.3 Tipos de prueba

**Tabla 13.** Tipos de prueba que se ejecutan

| **Tipo** | **Qué comprueba** | **Cómo se hace** |
| --- | --- | --- |
| Humo y cordura | Que lo esencial funciona antes de probar a fondo. | smoke-test.sh e inicio de sesión de los 3 roles. |
| Funcional de caja negra | Que cada función hace lo que dice su historia de usuario, sin mirar el código. | 51 casos del Anexo A, manuales y automatizados (tests/e2e). |
| Integridad (mutación documental) | Que cualquier cambio en un documento se detecta. | 20 documentos alterados de 5 formas (tests/integrity) y 5 casos manuales con captura. |
| Trazabilidad e inmutabilidad | Que el historial de la blockchain coincide con lo que se hizo y no se puede cambiar. | Casos TRZ-01 a TRZ-03. |
| Rendimiento | Tiempos de registro y de verificación. | 50 verificaciones consecutivas (tests/perf) y tiempos del registro de los 20 documentos. |
| Regresión y re-prueba | Que una corrección no daña lo que ya funcionaba. | 144 pruebas automáticas del backend, pruebas del chaincode y la prueba e2e de 47 pasos. |
| Usabilidad e interfaz | Que las pantallas se entienden, los mensajes son claros y todo está en español. | Recorrido de cada rol y pruebas exploratorias. |

*Fuente: elaboración propia.*

## 5.4 Paso 3: buenas prácticas

* **Pruebas según el contexto:** se prueba lo que más importa para este sistema: que la integridad, la trazabilidad y los permisos sean correctos.
* **Pruebas desde el inicio (shift left):** las pruebas automáticas se escribieron junto con el código desde el Sprint 1; hoy hay 144 pruebas del backend y las del chaincode, todas aprobadas.
* **Pruebas exploratorias:** además de los casos escritos, se usa el sistema libremente para encontrar lo que los casos no previeron.
* **Flujos de punta a punta:** se prueba el recorrido real completo: el Empleado carga, el Verificador verifica y el Administrador consulta el resultado y el historial.
* **Versión congelada:** durante el Ciclo 2 no se cambia el código en Azure; si hay que corregir algo, se anota la nueva versión y se repiten los casos afectados en el Ciclo 3.

# 6. Cronograma de pruebas

Las pruebas se hicieron en dos etapas. Durante las **dos semanas anteriores al despliegue** (11 al 24 de octubre de 2026) se probó todo en el entorno local. El **25 de octubre** se desplegó el sistema en Azure y del **25 al 29 de octubre** se ejecutaron las pruebas sobre el despliegue.

**Tabla 14.** Cronograma general

| **Tarea** | **Fechas** |
| --- | --- |
| Diseño de los casos y de los datos de prueba | 11 al 24 de octubre de 2026 |
| Pruebas locales: automatizadas, de punta a punta y ensayos (ciclo 1) | 11 al 24 de octubre de 2026 |
| Despliegue en Azure y prueba de humo | 25 de octubre de 2026 |
| Creación del plan de pruebas (este documento) | 25 de octubre de 2026 |
| Ejecución de los casos sobre el despliegue (ciclo 2) | 25 al 29 de octubre de 2026 |
| Corrección de defectos y re-pruebas (ciclo 3) | 27 al 29 de octubre de 2026 |
| Informe de resultados | 29 de octubre de 2026 |

*Fuente: elaboración propia.*

Para medir el KPI de ejecución del PPS (85 % de actividades cerradas a tiempo), el plan se divide en 20 actividades:

**Tabla 15.** Actividades del Plan de Pruebas

| **N.°** | **Actividad** | **Responsable** | **Fecha límite** |
| --- | --- | --- | --- |
| 1 | Diseñar los casos funcionales (Anexo A) | Sofia y Laura | 17/10/2026 |
| 2 | Pruebas automáticas del backend y del contrato inteligente (local) | Sofia | 20/10/2026 |
| 3 | Prueba de punta a punta de la API en local (47 pasos) | Sofia | 22/10/2026 |
| 4 | Ensayo local de los casos de interfaz y usabilidad | Laura | 24/10/2026 |
| 5 | Ensayo local de la latencia de verificación | Sofia | 24/10/2026 |
| 6 | Preparar los datos de prueba (20 documentos y archivos de límite) y ensayo local de integridad | Sofia | 25/10/2026 |
| 7 | Despliegue en Azure y prueba de humo | Sofia | 25/10/2026 |
| 8 | Redactar el plan de pruebas | Laura y Sofia | 25/10/2026 |
| 9 | Ejecutar los casos de EP-01 (autenticación) | Laura | 26/10/2026 |
| 10 | Ejecutar los casos de EP-02 (gestión documental) | Laura | 26/10/2026 |
| 11 | Ejecutar los casos de EP-03 (verificación) | Sofia | 27/10/2026 |
| 12 | Ejecutar los casos de EP-04 (administración) | Laura | 27/10/2026 |
| 13 | Ejecutar los casos de EP-05 (infraestructura) | Sofia | 27/10/2026 |
| 14 | Prueba de integridad con los 20 documentos (INT-01) | Sofia | 27/10/2026 |
| 15 | Casos de integridad manuales con captura (INT-02 a INT-06) | Laura | 28/10/2026 |
| 16 | Pruebas de trazabilidad e inmutabilidad (TRZ-01 a TRZ-03) | Sofia | 28/10/2026 |
| 17 | Pruebas de rendimiento (REN-01 y REN-02) | Sofia | 28/10/2026 |
| 18 | Reporte de defectos, re-pruebas y regresión (ciclo 3) | Sofia y Laura | 29/10/2026 |
| 19 | Informe de resultados y matriz de cumplimiento de requerimientos | Laura | 29/10/2026 |
| 20 | Manual de usuario y entrega de evidencias | Laura | 29/10/2026 |

*Fuente: elaboración propia.*

**Duración total: 2 sprints de pruebas**: pruebas locales (11 al 24 de octubre de 2026) y pruebas sobre el despliegue (25 al 29 de octubre de 2026).

# 7. Entregables de prueba

**Tabla 16.** Entregables

| **Entregable** | **Descripción** | **Fecha objetivo** |
| --- | --- | --- |
| Plan de pruebas (este documento) | Alcance, estrategia, entornos, cronograma, recursos y criterios. | 25/10/2026 |
| Casos de prueba funcionales | Los 51 casos funcionales y los 11 de integridad, trazabilidad y rendimiento (Anexo A). | 24/10/2026 |
| Reportes de defectos | Cada defecto con pasos para reproducirlo y capturas, en GitHub Issues. | Durante la ejecución |
| Informe de resultados y defectos | Resultado de cada caso, KPI medidos, defectos por severidad, módulo y prioridad, y acciones correctivas. | 29/10/2026 |
| Matriz de cumplimiento de requerimientos | Cruce de cada requerimiento con los casos que lo prueban y su resultado. | 29/10/2026 |
| Evidencias | Capturas de pantalla, archivos CSV y los informes generados por las pruebas automatizadas. | 29/10/2026 |
| Manual de usuario y operación | Uso del sistema por rol y guía de despliegue en Docker. | 29/10/2026 |

*Fuente: elaboración propia.*

# 8. Criterios de entrada y salida

Estos son los criterios de entrada y salida de cada fase del ciclo de vida de las pruebas:

## 8.1 Análisis de requerimientos

### Criterios de entrada

* El equipo tiene el documento de requerimientos (55 RF y 30 RNF), el backlog con las 24 historias de usuario y sus 51 escenarios de aceptación.

### Criterios de salida

* Cada requerimiento a probar está entendido y relacionado con al menos un caso.
* Las dudas están resueltas con el director o anotadas como pregunta abierta.

## 8.2 Ejecución de pruebas

### Criterios de entrada

* El plan y los casos de prueba están revisados por el equipo; la aprobación formal se registra en la sección 11.
* El sistema está desplegado en el entorno de validación y la prueba de humo pasa.
* Las pruebas automatizadas de la versión a probar están aprobadas.
* Los datos de prueba y los usuarios de cada rol están listos.

Estado de las pruebas automatizadas al aprobar este plan (25 de octubre de 2026, entorno local):

**Tabla 17.** Estado de las pruebas automatizadas

| **Prueba** | **Resultado** |
| --- | --- |
| Pruebas automáticas del backend (Jest) | 144 de 144 aprobadas |
| Pruebas del contrato inteligente (Go) | Aprobadas |
| Prueba de punta a punta de la API (tests/e2e) | 47 de 47 pasos aprobados |
| Ensayo de integridad con los 20 documentos (tests/integrity) | 20 de 20 detectadas, 0 falsos positivos, trazabilidad 20 de 20 |
| Ensayo de latencia de la verificación (tests/perf) | Percentil 95 de 2040 ms (meta: 3000 ms o menos) |

*Fuente: elaboración propia.*

### Criterios de salida

* Todos los casos del Anexo A se ejecutaron y tienen resultado (PASS, FAIL o bloqueado con su motivo).
* Los reportes de defectos y de casos están listos.
* No quedan defectos críticos abiertos.
* Se cumplen los KPI: 90 % o más de casos funcionales en PASS, 100 % de detección de alteraciones y latencia P95 menor o igual a 3000 ms.

## 8.3 Cierre de pruebas

### Criterios de entrada

* Los reportes de casos y de defectos están listos.

### Criterios de salida

* Se entregan el informe de resultados y defectos y la matriz de cumplimiento de requerimientos.
* El director y la codirectora aprueban el informe.

# 9. Herramientas

Estas son las herramientas que se usan en el proyecto:

**Tabla 18.** Herramientas de prueba

| **Herramienta** | **Para qué se usa** |
| --- | --- |
| Jest | Pruebas automáticas del backend (144 pruebas). |
| go test | Pruebas automáticas del contrato inteligente. |
| tests/e2e/e2e.sh | Prueba automática de punta a punta de la API con los 3 roles. |
| tests/integrity | Generación de los 20 documentos sintéticos y prueba de mutación documental. |
| tests/perf | Medición de la latencia de la verificación. |
| docker/smoke-test.sh | Prueba de humo de la red blockchain. |
| Postman y la especificación OpenAPI | Pruebas manuales de la API (docs/api). |
| Google Chrome, Microsoft Edge y Mozilla Firefox (con sus herramientas de desarrollador) | Ejecución de casos de interfaz y revisión de las peticiones de red. |
| Herramienta Recortes de Windows | Capturas de pantalla de evidencia. |
| GitHub Issues | Registro y seguimiento de defectos. |
| Microsoft Word y Excel | Plan, casos, informe y matriz de cumplimiento. |
| Docker Desktop y MongoDB Compass | Revisión de contenedores y de la base de datos en el entorno local. |

*Fuente: elaboración propia.*

# 10. Riesgos y mitigaciones

Estos son los riesgos posibles y cómo se mitigan:

**Tabla 19.** Riesgos y mitigaciones

| **Riesgo** | **Mitigación** |
| --- | --- |
| El entorno de Azure no está disponible (máquina apagada, falla o crédito agotado). | Apagado automático solo de noche, alerta de presupuesto en Azure y el entorno local listo como respaldo para ensayos. |
| El código de verificación tarda en llegar o se alcanza el límite diario de Brevo (300 correos). | Agrupar los inicios de sesión, reutilizar sesiones abiertas y ejecutar con margen en el cronograma. |
| Una de las dos personas del equipo no está disponible. | Los casos están escritos paso a paso para que cualquiera de las dos los ejecute. |
| Poco tiempo para probar. | Priorizar los casos Alta y los KPI; los Baja se ejecutan al final. |
| Un cambio de código durante la ejecución invalida resultados anteriores. | Versión congelada durante el Ciclo 2; las correcciones se prueban en el Ciclo 3 con regresión. |
| Los datos de prueba se mezclan con datos de demostración. | Los documentos de prueba tienen códigos únicos (C01 a C12, N01 a N08) y las ejecuciones se identifican por fecha y hora. |
| Funcionalidades aún sin implementar (HU-023 y HU-022 CA-03). | Se registran como defectos (DEF-03 y DEF-04); si no se implementan a tiempo, sus casos se reportan como FAIL con su justificación. Aun así, la meta de 90 % se alcanza si pasan los demás 47 casos (92 %). |

*Fuente: elaboración propia.*

# 11. Aprobaciones

El equipo enviará los siguientes documentos para aprobación del director y la codirectora:

* Plan de pruebas
* Escenarios de prueba
* Casos de prueba
* Informes

**Las pruebas solo avanzan a la siguiente fase cuando se registra la aprobación correspondiente.**

**Tabla 20.** Registro de aprobación

| **Rol** | **Nombre** | **Firma** | **Fecha** |
| --- | --- | --- | --- |
| Elaboró | Sofia Ortiz Daza |  |  |
| Elaboró | Laura Sofia Diaz Suarez |  |  |
| Aprobó (director) | Juan Carlos Navarro Beltrán |  |  |
| Aprobó (codirectora) | Solangie Paola Garavito Mendivelso |  |  |

*Fuente: elaboración propia.*

# Anexo A. Catálogo de casos de prueba

El catálogo tiene **51 casos funcionales** (uno por escenario de aceptación de las 24 historias de usuario) y **11 casos** de integridad, trazabilidad y rendimiento. La columna "Ejecución" indica si el caso se hace a mano, con una prueba automatizada del proyecto o de ambas formas. Los resultados de cada caso se registran en el informe de resultados.

## A.1 EP-01 Autenticación y control de acceso

**Tabla 21.** Casos de prueba de EP-01

| **ID** | **Historia** | **Caso** | **Precondición** | **Pasos** | **Resultado esperado** | **Datos de prueba** | **Técnica** | **Ejecución** | **Prioridad** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-01 | HU-001 CA-01 | Inicio de sesión con credenciales válidas | El usuario está en la pantalla de inicio de sesión, sin sesión activa. | Ingresar correo y contraseña válidos y pulsar Iniciar sesión. | El sistema pide el código de verificación de 6 dígitos enviado al correo. | Usuario Empleado de prueba | Casos de uso | Manual + automatizada (e2e) | Alta |
| CP-02 | HU-001 CA-02 | Inicio de sesión con credenciales inválidas | El usuario está en la pantalla de inicio de sesión. | Ingresar un correo registrado con una contraseña errada y enviar. | Mensaje "Credenciales inválidas." sin indicar cuál dato está mal. No se envía código. | Contraseña: "clave-erronea" | Partición de equivalencia | Manual + automatizada (e2e) | Alta |
| CP-03 | HU-002 CA-01 | Código de verificación válido | El usuario recibió en su correo un código vigente (5 minutos). | Escribir el código de 6 dígitos y pulsar Verificar código. | El sistema abre el panel que corresponde al rol del usuario. | Código recibido por correo | Casos de uso | Manual + automatizada (e2e) | Alta |
| CP-04 | HU-002 CA-02 | Acceso a un panel de otro rol | El Empleado tiene una sesión activa. (El rol se toma de la cuenta: no hay selector de rol.) | Escribir en la barra de direcciones la ruta del panel de Administrador. | El sistema no muestra el panel y devuelve al usuario al inicio de sesión. La API responde 403 a cualquier acción de otro rol. | Ruta /administrador/dashboard | Tabla de decisión | Manual + automatizada (e2e) | Alta |
| CP-05 | HU-003 CA-01 | Cierre de sesión | El usuario tiene una sesión activa. | Abrir el menú de usuario y elegir Cerrar sesión. | Se invalida la sesión en el servidor y aparece la pantalla de sesión cerrada. | Cualquier rol | Casos de uso | Manual + automatizada (e2e) | Alta |
| CP-06 | HU-003 CA-02 | Acceso después de cerrar sesión | El usuario cerró sesión. | Intentar abrir de nuevo una pantalla protegida (por ejemplo, Mis documentos). | El sistema redirige al inicio de sesión. El token anterior ya no sirve (401). | Ruta /empleado/documentos | Transición de estados | Manual + automatizada (e2e) | Alta |
| CP-07 | HU-004 CA-01 | Cambio de contraseña correcto | El usuario tiene sesión activa y conoce su contraseña actual. | Menú de usuario, Cambiar contraseña: escribir la actual y una nueva de 8 o más caracteres; confirmar. | Mensaje de éxito. La nueva contraseña queda guardada como hash con sal; el siguiente inicio de sesión funciona solo con la nueva. | Nueva: "OtraClave123" | Valores límite (8 caracteres) | Manual + automatizada (e2e) | Media |
| CP-08 | HU-004 CA-02 | Cambio de contraseña con la actual errada | El usuario tiene sesión activa. | Escribir una contraseña actual incorrecta y una nueva válida; confirmar. | Mensaje "La contraseña actual es incorrecta." y la contraseña no cambia. | Actual: "mala" | Partición de equivalencia | Manual + automatizada (e2e) | Media |
| CP-09 | HU-022 CA-01 | Bloqueo tras 5 intentos fallidos | Una cuenta activa de prueba. | Fallar la contraseña 5 veces seguidas y en el sexto intento usar la correcta. | El sexto intento se rechaza con el mensaje de cuenta bloqueada temporalmente y los minutos que faltan. | Usuario de prueba creado para el caso | Valores límite (5 y 6 intentos) | Manual + automatizada (e2e) | Alta |
| CP-10 | HU-022 CA-02 | Desbloqueo pasados 15 minutos | La cuenta del caso anterior está bloqueada. | Esperar 15 minutos e iniciar sesión con la contraseña correcta. | El sistema continúa con el envío del código y el contador de intentos vuelve a cero. | El mismo usuario de prueba | Valores límite (15 minutos) | Manual | Media |
| CP-11 | HU-022 CA-03 | Registro de intentos fallidos | Un usuario escribe credenciales incorrectas. | Enviar el formulario con una contraseña errada y revisar el registro de intentos. | Queda registrado el correo, la fecha, la hora y el motivo, sin guardar la contraseña. Pendiente de implementar (DEF-03). | Contraseña errada | Casos de uso | Manual | Media |
| CP-12 | HU-022 CA-04 | Cierre por inactividad | El usuario tiene una sesión activa. | No usar el sistema durante 15 minutos y luego intentar una acción. | La sesión se cierra y el sistema exige iniciar sesión de nuevo. | Cualquier rol | Valores límite (15 minutos) | Manual + automatizada (unitaria) | Media |
| CP-13 | HU-023 CA-01 | Política de datos en el primer ingreso | Un usuario inicia sesión por primera vez. | Completar el inicio de sesión y el código. | Se presenta la política de tratamiento de datos y no se habilita nada más hasta aceptarla. Pendiente de implementar (DEF-04). | Usuario nuevo | Casos de uso | Manual | Alta |
| CP-14 | HU-023 CA-02 | Aceptación de la política | El usuario ve la política de tratamiento de datos. | Pulsar Aceptar. | Se registra usuario, fecha, hora y versión aceptada, y se abre su panel. Pendiente de implementar (DEF-04). | Usuario nuevo | Casos de uso | Manual | Alta |
| CP-15 | HU-023 CA-03 | Acceso sin aceptar la política | El usuario no ha aceptado la política. | Intentar abrir otra pantalla del sistema. | El sistema lo impide y mantiene la solicitud de aceptación. Pendiente de implementar (DEF-04). | Usuario nuevo | Transición de estados | Manual | Alta |

*Fuente: elaboración propia a partir de los escenarios de aceptación del backlog.*

## A.2 EP-02 Registro y gestión documental (Empleado)

**Tabla 22.** Casos de prueba de EP-02

| **ID** | **Historia** | **Caso** | **Precondición** | **Pasos** | **Resultado esperado** | **Datos de prueba** | **Técnica** | **Ejecución** | **Prioridad** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-16 | HU-005 CA-01 | Carga de un PDF válido de 10 MB | El Empleado está en Cargar documento. | Seleccionar un PDF de 10 MB y pulsar Cargar y generar SHA-256. | El archivo se acepta y continúa el registro. | PDF sintético de 10 MB | Partición de equivalencia | Manual | Alta |
| CP-17 | HU-005 CA-02 | Rechazo de DOCX o PDF de 25 MB | El Empleado está en Cargar documento. | Intentar cargar un archivo .docx y luego un PDF de 25 MB. | Ambos se rechazan con el motivo: solo PDF de hasta 20 MB. | archivo.docx; PDF de 25 MB | Valores límite (20 MB) | Manual + automatizada (e2e) | Alta |
| CP-18 | HU-006 CA-01 | Metadatos y huella automáticos | Un PDF superó las validaciones de carga. | Completar la carga. | Se muestran identificador, nombre, responsable, fecha y la huella SHA-256 (enmascarada para el Empleado). | C01 de los documentos de prueba | Casos de uso | Manual + automatizada (e2e) | Alta |
| CP-19 | HU-006 CA-02 | La huella no cambia para el mismo contenido | Un documento ya registrado. | Verificar ese mismo archivo (el sistema recalcula su huella). | El hash recalculado es exactamente igual al registrado: "Integridad confirmada". | Archivo original sin cambios | Casos de uso | Manual + automatizada (integridad) | Alta |
| CP-20 | HU-007 CA-01 | Registro en la blockchain con txID | La huella del documento fue generada. | Completar la carga y abrir Mi trazabilidad. | Aparece el evento Carga de documento con su identificador de transacción (TX). | Documento recién cargado | Casos de uso | Manual + automatizada (e2e) | Alta |
| CP-21 | HU-007 CA-02 | Falla de la red blockchain | La red Fabric no está disponible (se detiene el peer en el entorno local). | Intentar cargar un PDF. | No aparece mensaje de éxito; se informa que la red blockchain no está disponible. | Peer detenido (solo entorno local) | Adivinación de errores | Automatizada (unitaria) + manual local | Alta |
| CP-22 | HU-008 CA-01 | Mis documentos muestra solo los propios | Dos Empleados con documentos cargados. | Cada Empleado abre Mis documentos. | Cada uno ve únicamente sus documentos con su estado actual. | Empleado 1 y Empleado 2 | Tabla de decisión | Manual + automatizada (e2e) | Alta |
| CP-23 | HU-008 CA-02 | Estado inicial Pendiente | Un documento sin verificaciones. | Abrir Mis documentos. | El documento aparece con estado Pendiente. | Documento recién cargado | Transición de estados | Manual + automatizada (e2e) | Media |
| CP-24 | HU-009 CA-01 | Trazabilidad de mis documentos | Un documento con carga y verificaciones. | Abrir Mi trazabilidad. | Historial en orden cronológico con documento, acción, fecha, hora, TX y resultado. | Documento C01 | Casos de uso | Manual + automatizada (e2e) | Alta |
| CP-25 | HU-009 CA-02 | Trazabilidad de un documento ajeno | Un documento de otro Empleado. | Pedir su trazabilidad (por la API con la sesión del Empleado 2). | El sistema deniega el acceso (403). | Identificador de un documento del Empleado 1 | Tabla de decisión | Automatizada (e2e) | Alta |

*Fuente: elaboración propia a partir de los escenarios de aceptación del backlog.*

## A.3 EP-03 Verificación de integridad documental (Verificador)

**Tabla 23.** Casos de prueba de EP-03

| **ID** | **Historia** | **Caso** | **Precondición** | **Pasos** | **Resultado esperado** | **Datos de prueba** | **Técnica** | **Ejecución** | **Prioridad** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-26 | HU-010 CA-01 | Selección de un documento registrado | Existen documentos registrados. | Elegir la persona responsable y luego el contrato (o pegar el identificador). | El sistema confirma el documento y habilita la carga del archivo a comparar. | Documento C01 | Casos de uso | Manual + automatizada (e2e) | Alta |
| CP-27 | HU-010 CA-02 | Identificador inexistente | El Verificador está en Verificar integridad. | Pegar un identificador que no existe y pulsar Buscar. | Mensaje "El documento no está registrado." | 00000000-0000-0000-0000-000000000000 | Partición de equivalencia | Manual + automatizada (e2e) | Media |
| CP-28 | HU-011 CA-01 | Huella completa para el Verificador | Un documento existente. | Seleccionarlo en Verificar integridad. | Se muestra el hash SHA-256 registrado completo (64 caracteres). | Documento C01 | Tabla de decisión | Manual + automatizada (e2e) | Alta |
| CP-29 | HU-011 CA-02 | Empleado sin acceso a la huella ajena | Un Empleado y un documento de otra persona. | Consultar el documento ajeno por la API con la sesión del Empleado. | El acceso se deniega; el Empleado solo ve huellas enmascaradas de lo suyo. | Sesión del Empleado 2 | Tabla de decisión | Automatizada (e2e) | Alta |
| CP-30 | HU-012 CA-01 | Carga del archivo a comparar | Documento seleccionado. | Cargar un PDF válido en el paso 2. | El archivo aparece como Listo y se habilita Comparar huellas SHA-256. | PDF válido | Casos de uso | Manual | Media |
| CP-31 | HU-012 CA-02 | Archivo a comparar de 30 MB | Documento seleccionado. | Intentar cargar un PDF de 30 MB. | Se rechaza informando el límite de 20 MB. | PDF de 30 MB | Valores límite (20 MB) | Manual | Media |
| CP-32 | HU-013 CA-01 | Huellas idénticas | Documento seleccionado y el mismo archivo original. | Pulsar Comparar huellas SHA-256. | Mensaje "Integridad confirmada: los hashes son idénticos" con ambas huellas. | Original de C01 | Casos de uso | Manual + automatizada (integridad) | Alta |
| CP-33 | HU-013 CA-02 | Huellas distintas | Documento seleccionado y una copia alterada. | Pulsar Comparar huellas SHA-256. | Mensaje "Integridad comprometida: los hashes no coinciden" y se muestran las dos huellas. | Alterado de C01 (salario) | Casos de uso | Manual + automatizada (integridad) | Alta |
| CP-34 | HU-014 CA-01 | Estado Verificado y evento en el ledger | Una verificación con huellas iguales. | Revisar el estado del documento y la trazabilidad. | El estado cambia a Verificado y aparece el evento con su TX y resultado OK. | Documento C01 | Transición de estados | Manual + automatizada (e2e) | Alta |
| CP-35 | HU-014 CA-02 | Nueva verificación | El Verificador terminó una verificación. | Pulsar Nueva verificación. | Vuelve el formulario vacío de selección de documento. | N/A | Casos de uso | Manual | Baja |
| CP-36 | HU-015 CA-01 | Listado general de documentos | El Verificador inicia sesión. | Abrir Documentos. | Se ven todos los documentos con sus seis campos: nombre, responsable, fecha, identificador, huella y estado. | N/A | Casos de uso | Manual + automatizada (e2e) | Media |
| CP-37 | HU-015 CA-02 | Huella restringida para roles no autorizados | Un rol que no es Verificador consulta el listado. | Abrir el listado de documentos como Administrador o Empleado. | La huella se muestra enmascarada (por ejemplo d3f3aef7•••0a5c4f39). | Sesión de Administrador | Tabla de decisión | Manual + automatizada (e2e) | Alta |
| CP-38 | HU-016 CA-01 | Trazabilidad global | Existen eventos registrados. | Abrir Trazabilidad global. | Se ven los eventos de todos los documentos en orden cronológico. | N/A | Casos de uso | Manual + automatizada (e2e) | Media |
| CP-39 | HU-016 CA-02 | Campos de la trazabilidad global | El listado de eventos del ledger. | Revisar las columnas. | Se muestran Documento, Acción, Usuario, TX ID, Fecha y Resultado. | N/A | Casos de uso | Manual | Media |

*Fuente: elaboración propia a partir de los escenarios de aceptación del backlog.*

## A.4 EP-04 Administración del sistema

**Tabla 24.** Casos de prueba de EP-04

| **ID** | **Historia** | **Caso** | **Precondición** | **Pasos** | **Resultado esperado** | **Datos de prueba** | **Técnica** | **Ejecución** | **Prioridad** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-40 | HU-017 CA-01 | Panel con los cuatro totales | El Administrador inicia sesión. | Abrir el Dashboard. | Se ven Total documentos, Verificados, Pendientes y Alterados, y la actividad reciente. | N/A | Casos de uso | Manual + automatizada (e2e) | Media |
| CP-41 | HU-017 CA-02 | La suma de estados coincide con el total | Documentos en distintos estados. | Sumar Verificados + Pendientes + Alterados. | La suma es igual al Total documentos. | Datos de la ejecución | Casos de uso | Manual + automatizada (e2e) | Media |
| CP-42 | HU-018 CA-01 | Creación de usuario | El Administrador está en Usuarios. | Nuevo usuario: nombre, correo no registrado y rol; Crear usuario. | El usuario queda Activo con el rol elegido y se entrega una contraseña temporal. Un correo repetido se rechaza. | Correo nuevo de prueba | Partición de equivalencia | Manual + automatizada (e2e) | Alta |
| CP-43 | HU-018 CA-02 | Desactivación conserva el historial | Un usuario activo con documentos. | Desactivarlo e intentar iniciar sesión con él. | Queda Inactivo, no puede iniciar sesión y su trazabilidad se conserva. | Usuario de prueba con documentos | Transición de estados | Manual + automatizada (e2e) | Alta |
| CP-44 | HU-019 CA-01 | Listado administrativo de documentos | El Administrador inicia sesión. | Abrir Documentos. | Se ven todos los documentos con sus seis campos, sin exponer el contenido del archivo. | N/A | Casos de uso | Manual + automatizada (e2e) | Media |
| CP-45 | HU-019 CA-02 | Mismos campos que el Verificador | Un documento registrado. | Comparar el listado del Administrador con el del Verificador. | Se muestran los mismos campos; la huella del Administrador va enmascarada. | Documento C01 | Tabla de decisión | Manual | Baja |
| CP-46 | HU-020 CA-01 | Trazabilidad administrativa | Existen eventos registrados. | Abrir Trazabilidad. | Se ven los eventos de todos los documentos con TX ID y Resultado. | N/A | Casos de uso | Manual + automatizada (e2e) | Media |
| CP-47 | HU-020 CA-02 | Detalle igual o mayor que el Verificador | Las pantallas de trazabilidad de ambos roles. | Comparar columnas y registros. | El Administrador ve igual o más detalle que el Verificador. | N/A | Tabla de decisión | Manual | Baja |
| CP-48 | HU-024 CA-01 | Cambio de rol | Un usuario existente con sesión abierta. | El Administrador le cambia el rol. | La sesión abierta se corta y el nuevo rol aplica desde su siguiente inicio de sesión. | Usuario de prueba | Transición de estados | Manual + automatizada (e2e) | Alta |
| CP-49 | HU-024 CA-02 | Desactivación (edición de usuarios) | Un usuario activo con documentos. | El Administrador lo desactiva. | Conserva su trazabilidad y ya no puede iniciar sesión. El Administrador no puede desactivarse a sí mismo. | Usuario de prueba | Transición de estados | Manual + automatizada (e2e) | Media |

*Fuente: elaboración propia a partir de los escenarios de aceptación del backlog.*

## A.5 EP-05 Infraestructura y despliegue

**Tabla 25.** Casos de prueba de EP-05

| **ID** | **Historia** | **Caso** | **Precondición** | **Pasos** | **Resultado esperado** | **Datos de prueba** | **Técnica** | **Ejecución** | **Prioridad** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-50 | HU-021 CA-01 | Todo el sistema arranca en contenedores | Servidor con Docker y el proyecto descargado. | Ejecutar bash docker/up.sh y luego docker ps. | Arrancan frontend, backend, MongoDB, la red Fabric (orderer, 2 peers, 3 CA), el chaincode y, en Azure, Caddy. | Entorno de validación | Casos de uso | Manual + automatizada (smoke-test.sh) | Alta |
| CP-51 | HU-021 CA-02 | El frontend no habla con la blockchain | El código fuente y el sistema en ejecución. | Revisar el código del frontend y las peticiones de red del navegador. | Todas las peticiones van a /api (backend); ninguna va a los nodos de Fabric. | Herramientas del navegador | Revisión estática | Manual + automatizada (smoke-test.sh) | Alta |

*Fuente: elaboración propia a partir de los escenarios de aceptación del backlog.*

## A.6 Casos de integridad, trazabilidad y rendimiento

**Tabla 26.** Casos no funcionales

| **ID** | **Categoría** | **Caso** | **Pasos** | **Resultado esperado** | **Ejecución** |
| --- | --- | --- | --- | --- | --- |
| INT-01 | Integridad | Mutación documental de los 20 documentos sintéticos | Por cada documento: registrar el original, verificarlo con el original y con su copia alterada. | 20 de 20 alteraciones detectadas (Alterado) y 0 originales marcados como alterados. | Automatizada (tests/integrity) |
| INT-02 | Integridad | Alteración de texto en la interfaz | Verificar en pantalla un contrato con el salario cambiado. | Integridad comprometida. | Manual con captura |
| INT-03 | Integridad | Alteración de firma en la interfaz | Verificar en pantalla un contrato con otro firmante. | Integridad comprometida. | Manual con captura |
| INT-04 | Integridad | Alteración solo de metadatos | Verificar en pantalla un documento cuyo contenido visible es idéntico pero cambió su autor. | Integridad comprometida, aunque a simple vista se vea igual. | Manual con captura |
| INT-05 | Integridad | Cambio de un solo carácter | Verificar en pantalla un documento donde un punto pasó a ser coma. | Integridad comprometida. | Manual con captura |
| INT-06 | Integridad | Anexo agregado | Verificar en pantalla un documento con una página extra al final. | Integridad comprometida. | Manual con captura |
| TRZ-01 | Trazabilidad | Orden cronológico del historial | Hacer carga, verificación confirmada y verificación comprometida de un documento y abrir su trazabilidad. | Aparecen las 3 acciones en el orden en que se hicieron, cada una con su TX ID. | Manual + automatizada |
| TRZ-02 | Trazabilidad | Inmutabilidad del registro | Verificar varias veces un documento y revisar su huella registrada. | La huella registrada no cambia; cada verificación agrega un evento nuevo sin borrar los anteriores. | Manual + automatizada |
| TRZ-03 | Trazabilidad | Consistencia entre la blockchain y la base de datos | Comparar el hash y el estado de cada documento en el ledger y en MongoDB. | Coinciden en el 100 % de los documentos. | Automatizada |
| REN-01 | Rendimiento | Latencia de la verificación | 50 verificaciones consecutivas del mismo documento (tests/perf). | Percentil 95 menor o igual a 3000 ms. | Automatizada (tests/perf) |
| REN-02 | Rendimiento | Latencia de la escritura del hash | Medir el tiempo de registro de los 20 documentos de INT-01. | Se reporta la media y el máximo (referencia: un bloque cada 2 s). | Automatizada (tests/integrity) |

*Fuente: elaboración propia.*
