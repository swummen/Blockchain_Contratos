## Portada
|  |  |  |
| --- | --- | --- |
| | | |
| | | |
| | | |
| | | |
| | | |
| | | |
| | | |
| | | |
| | Plantilla de requisitos y de historias de usuario | |
| | Especificación conforme a ISO/IEC/IEEE 29148:2018 · Atributos de calidad según ISO/IEC 25010:2023 | |
| | | |
| | IDENTIFICACIÓN DEL PROYECTO | |
| | Proyecto o sistema | MVP de un sistema web para la verificación de integridad y trazabilidad documental en contratos laborales mediante blockchain permisionada |
| | Organización o cliente | Empresa de servicios tecnológicos en Bogotá (caso de aplicación) / Universidad Católica de Colombia |
| | Equipo de trabajo | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | Responsable de la especificación | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | Versión del documento | 2.0 |
| | Fecha de la versión | 2026-08-31 00:00:00 |
| | | |
| | CONTENIDO REGISTRADO EN EL LIBRO | |
| | Requisitos funcionales | 53 |
| | Requisitos no funcionales | 30 |
| | Historias de usuario | 21 |
| | Escenarios de aceptación en Gherkin | 42 |
| | | |
| | Universidad Católica de Colombia · Facultad de Ingeniería · Ingeniería de Sistemas y Computación · Solangie Garavito | |

## Instrucciones
| Instrucciones de uso |  |  |  |
| --- | --- | --- | --- |
| Léelas antes de diligenciar. Las convenciones aplican a todas las hojas de captura. | | | |
| | | | |
| | | | |
| | HOJAS DEL LIBRO | | |
| | Hoja | Qué se registra allí | Quién la usa |
| | Portada | Datos del proyecto y conteo automático de lo ya capturado. | Equipo, al iniciar y al cerrar cada entrega |
| | Instrucciones | Convenciones de color, numeración de identificadores y criterios de calidad exigidos. | Todo el equipo, antes de capturar |
| | RF | Una fila por capacidad que el sistema debe ofrecer: flujo, reglas y criterios verificables. | Analista de requisitos |
| | RNF | Una fila por restricción de calidad, con la medida, el umbral y el método que la comprueba. | Analista de requisitos y arquitecto |
| | Ficha\_RF | Vista de un requisito funcional en formato de una página, para imprimir o anexar. | Quien prepara el informe |
| | Ficha\_RNF | Vista de un requisito no funcional en formato de una página, para imprimir o anexar. | Quien prepara el informe |
| | Historias\_Usuario | Narrativa, trazabilidad hacia requisitos, estimación y verificación de INVEST y de terminado. | Responsable del producto y equipo |
| | Criterios\_Gherkin | Un escenario por fila, asociado a la historia mediante su identificador. | Equipo de desarrollo y pruebas |
| | Definición\_Terminado | Acuerdo sobre cuándo una historia se da por concluida y con qué evidencia se sustenta. | Equipo completo, una sola vez |
| | Listas | Catálogos que alimentan las listas desplegables; se amplían aquí, nunca dentro de la captura. | Quien administra el libro |
| | | | |
| | CONVENCIONES DE COLOR | | |
| | Formato de la celda | Qué significa | Acción esperada |
| | Fondo blanco con borde | Campo de captura libre. | Escribe el contenido. |
| | Fondo gris | Campo derivado de otra celda del libro. | No escribas: se recalcula solo. |
| | Fondo ámbar | Campo que gobierna lo que muestra el resto de la hoja. | Elige un valor de la lista. |
| | | | |
| | NUMERACIÓN DE IDENTIFICADORES | | |
| | Elemento | Patrón | Regla |
| | Requisito funcional | RF-001, RF-002, ... | Consecutivo en la hoja RF; un identificador retirado no se reutiliza. |
| | Requisito no funcional | RNF-001, RNF-002, ... | Consecutivo en la hoja RNF; un identificador retirado no se reutiliza. |
| | Historia de usuario | HU-001, HU-002, ... | Consecutivo en el backlog, independiente del sprint en que se ejecute. |
| | Épica | EP-01, EP-02, ... | Agrupa historias que comparten un mismo objetivo de negocio. |
| | Escenario de aceptación | CA-01, CA-02, ... | Reinicia en cada historia; la pareja historia y escenario es única. |
| | Regla de negocio | RN-01, RN-02, ... | Se enuncia dentro del requisito funcional que la impone. |
| | | | |
| | CRITERIOS DE CALIDAD EXIGIDOS A CADA REQUISITO | | |
| | Característica | Cómo se comprueba en la revisión | Señal de incumplimiento |
| | Necesario | Al retirarlo queda sin cubrir una necesidad declarada por una parte interesada. | Nadie reclama su ausencia. |
| | Apropiado | Corresponde al alcance del sistema especificado y no al de un componente interno. | Impone una tecnología o un detalle de implementación. |
| | No ambiguo | Dos lectores distintos extraen la misma conclusión sobre lo exigido. | Aparecen adjetivos sin medida como rápido, amigable o robusto. |
| | Completo | Se entiende sin consultar otro documento ni recordar una conversación previa. | Requiere preguntar al autor para saber qué hace el sistema. |
| | Singular | Enuncia una sola capacidad o restricción. | Une varias exigencias con la conjunción y. |
| | Factible | Es realizable con el costo, el plazo y la técnica disponibles, con riesgo aceptable. | Nadie puede estimar su esfuerzo. |
| | Verificable | Existe una prueba, un análisis, una inspección o una demostración que decide si se cumple. | No se sabe qué evidencia lo daría por satisfecho. |
| | Correcto | Refleja fielmente la necesidad de la que proviene. | La parte interesada no se reconoce en el enunciado. |
| | Conforme | Respeta la plantilla y el vocabulario acordados para el proyecto. | Mezcla formatos o inventa términos propios. |
| | | | |
| | REFERENCIAS | | |
| | ISO/IEC/IEEE 29148:2018. Systems and software engineering. Life cycle processes. Requirements engineering. | | |
| | ISO/IEC 25010:2023. Systems and software Quality Requirements and Evaluation (SQuaRE). Product quality model. | | |

## RF
| Requisitos funcionales |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Una fila por requisito. Estructura tomada de la plantilla SRS conforme a ISO/IEC/IEEE 29148:2018. | | | | | | | | | | | | | | | | | | |
| La fila 7 es un ejemplo: sobrescríbela o bórrala antes de entregar. Las columnas con lista desplegable solo aceptan valores del catálogo. | | | | | | | | | | | | | | | | | | |
| | | | | | | | | | | | | | | | | | | |
| IDENTIFICACIÓN | | | | | 1. CONTEXTO Y JUSTIFICACIÓN | | | 2. CLASIFICACIÓN | | | 3. ESPECIFICACIÓN DETALLADA | | | | | 4. RELACIONES | | |
| ID del requisito | Título | Versión | Fecha de versión | Autor | Descripción general | Fuente o parte interesada | Justificación | Prioridad (MoSCoW) | Importancia | Estado | Precondiciones | Disparador | Flujo principal | Reglas de negocio y validaciones | Criterios de aceptación verificables | Dependencias | Requisitos hijos | Comentarios |
| RF-001 | Selección de rol de acceso | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Permite al usuario elegir, antes de autenticarse, el rol con el que iniciará sesión (Empleado, Verificador o Administrador). | Área de TI - Seguridad de la información | Los tres roles definen el alcance funcional del MVP y habilitan el control de acceso por rol (RBAC) exigido en RNF-03. | Debe (Must) | Alta | Aprobado | El usuario no tiene sesión activa. | El usuario ingresa a la URL del sistema. | 1. El sistema muestra las opciones Empleado, Verificador y Administrador. 2. El usuario selecciona un rol. 3. El sistema habilita el formulario de credenciales de RF-002. | RN-01: Solo se aceptan los tres roles predefinidos del sistema. | CA-01: Dado que el usuario está en la pantalla de inicio, cuando selecciona un rol válido, entonces el sistema muestra el formulario de autenticación correspondiente. | Ninguna | RF-002 | Corresponde al alcance funcional (tres roles) definido en el proyecto. |
| RF-002 | Autenticación mediante credenciales | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Solicita usuario y contraseña corporativos como primer factor de autenticación. | Área de TI - Seguridad de la información | Es la base del control de acceso y se complementa con el segundo factor de RF-003, conforme a RNF-02. | Debe (Must) | Alta | Aprobado | El usuario seleccionó un rol (RF-001). | El usuario visualiza el formulario de credenciales. | 1. El sistema solicita usuario y contraseña. 2. El usuario los ingresa y envía el formulario. 3. El sistema valida las credenciales contra el registro de usuarios y continúa con RF-003. | RN-01: Las contraseñas se validan contra el hash almacenado (RNF-01), nunca en texto plano. | CA-01: Dado credenciales válidas, cuando se envía el formulario, entonces el sistema solicita el token de segundo factor. CA-02: Dado credenciales inválidas, cuando se envía el formulario, entonces el sistema muestra un mensaje de error sin indicar cuál dato es incorrecto. | RF-001 | RF-003 | |
| RF-003 | Autenticación de segundo factor | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Envía un token de verificación al correo corporativo registrado del usuario como segundo factor. | Área de TI - Seguridad de la información | Refuerza la autenticación exigida por RNF-02 y reduce el riesgo de suplantación en el acceso a evidencia documental sensible. | Debe (Must) | Alta | Aprobado | Las credenciales ingresadas en RF-002 fueron validadas. | El sistema valida correctamente usuario y contraseña. | 1. El sistema genera un token de un solo uso. 2. El sistema lo envía al correo corporativo registrado. 3. El sistema muestra el campo para ingresar el token. | RN-01: El token tiene un tiempo de expiración definido y solo puede usarse una vez. | CA-01: Dado que las credenciales son válidas, cuando el sistema las procesa, entonces envía el token al correo registrado del usuario en menos de un minuto. | RF-002 | RF-004 | Pendiente de validar el canal exclusivo de correo corporativo frente a alternativas (SMS, app autenticadora); ver nota en RNF-02. |
| RF-004 | Validación del token | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Valida el token de segundo factor ingresado por el usuario antes de conceder acceso. | Área de TI - Seguridad de la información | Es el paso que cierra el ciclo de autenticación de doble factor exigido en RNF-02. | Debe (Must) | Alta | Aprobado | El token fue enviado (RF-003). | El usuario ingresa el token recibido. | 1. El usuario ingresa el token. 2. El sistema compara el token ingresado contra el generado. 3. Si coincide y no ha expirado, el sistema continúa con RF-005. | RN-01: Un token expirado o incorrecto no concede acceso. RN-02: Se define un número máximo de intentos antes de bloquear temporalmente el proceso. | CA-01: Dado un token correcto y vigente, cuando se valida, entonces el sistema concede acceso. CA-02: Dado un token incorrecto o expirado, cuando se valida, entonces el sistema deniega el acceso y lo informa al usuario. | RF-003 | RF-005 | |
| RF-005 | Control de acceso por rol | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Permite el acceso únicamente cuando credenciales, token y rol seleccionado son válidos y corresponden al usuario autenticado. | Área de TI - Seguridad de la información | Materializa el esquema RBAC exigido por RNF-03 al validar de forma cruzada el rol seleccionado y el rol asignado al usuario. | Debe (Must) | Alta | Aprobado | El token fue validado (RF-004). | El sistema concluye la validación del token. | 1. El sistema verifica que el rol seleccionado en RF-001 corresponda al rol asignado al usuario en la base de datos. 2. Si coinciden, el sistema concede acceso. 3. Si no coinciden, el sistema deniega el acceso. | RN-01: Un usuario no puede acceder con un rol distinto al que tiene asignado, aunque sus credenciales sean válidas. | CA-01: Dado que el rol seleccionado no coincide con el rol asignado, cuando el sistema valida el acceso, entonces lo deniega y muestra un mensaje de error. | RF-004 | RF-006 | |
| RF-006 | Redirección según rol | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Muestra al usuario el panel principal y las funcionalidades correspondientes a su rol tras autenticarse. | Área de TI / Usuarios finales de cada rol | Garantiza que cada usuario solo visualice las funcionalidades autorizadas para su rol, en línea con RNF-08. | Debería (Should) | Media | Aprobado | El acceso fue concedido (RF-005). | El sistema concede el acceso. | 1. El sistema identifica el rol del usuario autenticado. 2. El sistema redirige al panel correspondiente (Empleado, Verificador o Administrador). | RN-01: El contenido del panel se limita a las funcionalidades habilitadas para el rol. | CA-01: Dado un usuario con rol Empleado, cuando inicia sesión, entonces ve el panel de carga y consulta de documentos, sin las opciones administrativas. | RF-005 | Ninguno | |
| RF-007 | Cierre de sesión | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Permite a cualquier usuario autenticado cerrar su sesión de forma segura. | Área de TI - Seguridad de la información | Complementa la gestión segura de sesiones exigida en RNF-07. | Debe (Must) | Alta | Aprobado | El usuario tiene una sesión activa. | El usuario selecciona la opción Cerrar sesión. | 1. El usuario selecciona cerrar sesión. 2. El sistema invalida el token de sesión activo. 3. El sistema redirige a la pantalla de selección de rol (RF-001). | RN-01: Una sesión cerrada no puede reutilizarse para acceder a funcionalidades protegidas. | CA-01: Dado que el usuario cierra sesión, cuando intenta acceder de nuevo a una funcionalidad protegida sin autenticarse, entonces el sistema lo redirige al inicio de sesión. | Ninguna | Ninguno | |
| RF-008 | Carga de documentos | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Permite al usuario con rol Empleado cargar documentos contractuales en PDF para su registro y posterior verificación de integridad. | Área de Gestión Humana / Empleado firmante | Es la funcionalidad central del MVP: da inicio al proceso de generación de evidencia de integridad documental descrito en el alcance del proyecto. | Debe (Must) | Alta | Aprobado | El usuario está autenticado con rol Empleado. | El empleado selecciona Cargar documento. | 1. El sistema muestra el formulario de carga. 2. El empleado selecciona el archivo PDF. 3. El sistema ejecuta las validaciones de RF-009 a RF-012 antes de continuar con RF-013. | RN-01: Solo un usuario con rol Empleado puede iniciar la carga. | CA-01: Dado un archivo PDF válido, cuando el empleado lo carga, entonces el sistema inicia el proceso de registro. | RF-005 | RF-009, RF-010, RF-011, RF-012 | |
| RF-009 | Restricción de formato | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | El sistema acepta exclusivamente archivos con formato PDF. | Alcance técnico del proyecto (documentos contractuales en PDF) | El alcance del MVP delimita la gestión documental exclusivamente a contratos laborales y acuerdos de confidencialidad en formato PDF. | Debe (Must) | Alta | Aprobado | El empleado seleccionó un archivo para cargar. | El sistema recibe el archivo seleccionado. | 1. El sistema verifica la extensión y el tipo MIME del archivo. 2. Si es PDF, continúa el proceso; si no, rechaza la carga. | RN-01: Formatos distintos a PDF (DOCX, XML, imágenes) son rechazados, conforme a las limitaciones del proyecto. | CA-01: Dado un archivo con extensión .docx, cuando se intenta cargar, entonces el sistema lo rechaza e informa el motivo. | RF-008 | Ninguno | Alineado con RNF-23 y con la limitación funcional del proyecto (solo PDF). |
| RF-010 | Restricción de carga individual | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Permite la carga de un único documento por operación; no admite cargas masivas o por lotes. | Alcance técnico del proyecto | El MVP no contempla procesamiento masivo, conforme a las limitaciones definidas (sin pruebas de carga a escala empresarial). | Debe (Must) | Alta | Aprobado | El empleado accede al formulario de carga. | El empleado intenta seleccionar archivos. | 1. El formulario permite seleccionar un solo archivo. 2. Si el usuario intenta seleccionar más de uno, el sistema conserva solo el primero o muestra un aviso. | RN-01: No se permite selección múltiple de archivos en el control de carga. | CA-01: Dado que el empleado intenta seleccionar varios archivos a la vez, cuando confirma la selección, entonces el sistema le solicita elegir un único archivo. | RF-008 | Ninguno | |
| RF-011 | Restricción de tamaño | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Acepta únicamente archivos PDF con tamaño igual o inferior a 20 MB. | Decisión técnica del equipo de desarrollo (arquitectura y capacidad de procesamiento) | Limita el consumo de recursos de hashing y de almacenamiento de metadatos, preservando el rendimiento definido en RNF-09 y RNF-10. | Debe (Must) | Alta | Aprobado | El archivo fue seleccionado y es formato PDF (RF-009). | El sistema recibe el archivo para su validación. | 1. El sistema mide el tamaño del archivo. 2. Si es ≤20 MB, continúa el proceso; si no, lo rechaza. | RN-01: Archivos mayores a 20 MB no se procesan. | CA-01: Dado un archivo PDF de 25 MB, cuando se intenta cargar, entonces el sistema lo rechaza e informa el límite permitido. | RF-009 | Ninguno | Corresponde al umbral definido en RNF-24; es una decisión de diseño del proyecto, no proviene de una norma externa. |
| RF-012 | Validación previa de documentos | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Valida el formato y tamaño del archivo antes de iniciar su registro. | Equipo de desarrollo | Evita procesar documentos que no cumplen las restricciones del sistema antes de invertir recursos en el registro (RF-013 a RF-016). | Debe (Must) | Alta | Aprobado | El archivo fue seleccionado. | El empleado confirma la carga del archivo. | 1. El sistema ejecuta en conjunto las validaciones de formato (RF-009) y tamaño (RF-011). 2. Si ambas se cumplen, continúa con RF-013; si alguna falla, detiene el proceso y notifica el error. | RN-01: El registro (RF-013) no inicia si alguna validación previa falla. | CA-01: Dado un archivo que no cumple formato o tamaño, cuando se valida, entonces el sistema detiene el proceso antes de generar metadatos o huella. | RF-009, RF-011 | RF-013 | |
| RF-013 | Registro del documento | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Registra los metadatos asociados al documento cargado (identificador, nombre, usuario responsable y fecha de registro, como mínimo). | Empleado / Área de Gestión Humana | Provee la información operativa necesaria para la consulta (RF-018, RF-019) y la trazabilidad (RF-021, RF-022) del documento. | Debe (Must) | Alta | Aprobado | El archivo pasó las validaciones previas (RF-012). | El sistema confirma que el archivo es válido. | 1. El sistema genera un identificador único para el documento. 2. El sistema almacena en la base de datos no relacional el nombre, identificador, usuario responsable y fecha de registro. 3. El sistema continúa con RF-014. | RN-01: El contenido del documento no se almacena en la blockchain (ver RNF-04); solo se conservan metadatos y huella criptográfica. | CA-01: Dado un documento válido, cuando se registra, entonces el sistema le asigna un identificador único y guarda sus metadatos. | RF-012 | RF-014 | |
| RF-014 | Generación de huella criptográfica | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Genera automáticamente una huella criptográfica mediante SHA-256 a partir del contenido del documento cargado. | Alcance técnico del proyecto | El uso de SHA-256 está definido en el alcance técnico del proyecto y es el mecanismo central de verificación de integridad documental [34]. | Debe (Must) | Alta | Aprobado | El documento fue registrado (RF-013). | El sistema concluye el registro de metadatos. | 1. El sistema procesa el contenido binario del documento con el algoritmo SHA-256. 2. El sistema obtiene la huella digital de 256 bits. | RN-01: La huella se genera sobre el contenido completo del documento, de forma automática, sin intervención manual (RNF-11). | CA-01: Dado un documento registrado, cuando se genera su huella, entonces dos ejecuciones sobre el mismo contenido producen exactamente el mismo hash. | RF-013 | RF-015 | SHA-256 pertenece a la familia SHA-2 estandarizada por el NIST [34]; se eligió por ser el algoritmo utilizado internamente por Hyperledger Fabric [19]. |
| RF-015 | Registro de la huella criptográfica | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Registra la huella criptográfica generada como evidencia de integridad del documento. | Alcance técnico del proyecto | Provee la evidencia técnica verificable exigida por la Ley 527 de 1999 para sostener la integridad de un mensaje de datos [10]. | Debe (Must) | Alta | Aprobado | La huella fue generada (RF-014). | El sistema obtiene el hash SHA-256 del documento. | 1. El sistema asocia la huella al identificador del documento. 2. El sistema envía la huella al módulo de registro en blockchain (RF-016). | RN-01: La huella registrada es la única evidencia de integridad reconocida por el sistema para comparaciones posteriores. | CA-01: Dado que la huella fue generada, cuando se registra, entonces queda asociada de forma unívoca al identificador del documento. | RF-014 | RF-016 | |
| RF-016 | Registro en blockchain | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Registra en la red blockchain permisionada (Hyperledger Fabric) la huella criptográfica y los eventos asociados al documento, sin almacenar el archivo PDF directamente en la blockchain. | Alcance técnico del proyecto | Corresponde al modelo de persistencia híbrida definido en el proyecto: la blockchain conserva evidencia inmutable sin exponer el contenido del documento [19], [31]. | Debe (Must) | Alta | Aprobado | La huella fue registrada en el módulo documental (RF-015). | El sistema envía la huella al chaincode. | 1. El backend invoca al chaincode mediante el Fabric SDK. 2. El chaincode registra la huella y el evento registro en el ledger. 3. La red retorna un identificador de transacción (txID). | RN-01: El chaincode nunca recibe ni almacena el archivo PDF, solo la huella y los metadatos del evento. RN-02: Toda transacción generada obtiene un txID único. | CA-01: Dado que la huella fue enviada al chaincode, cuando se registra en el ledger, entonces el sistema recibe un txID válido. | RF-015 | RF-017 | Corresponde a RNF-04, RNF-05 y RNF-20. |
| RF-017 | Confirmación de registro | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Informa al empleado cuando el documento fue registrado correctamente y su huella criptográfica fue generada. | Empleado | Brinda retroalimentación clara al usuario sobre el resultado de la operación, conforme a RNF-17. | Debería (Should) | Media | Aprobado | El registro en blockchain fue exitoso (RF-016). | El sistema recibe el txID de confirmación del ledger. | 1. El sistema recibe la confirmación del chaincode. 2. El sistema muestra al empleado un mensaje de éxito con el identificador del documento. | RN-01: Si el registro en blockchain falla, el sistema no debe mostrar un mensaje de éxito. | CA-01: Dado un registro exitoso, cuando concluye, entonces el empleado ve un mensaje de confirmación con el identificador del documento. | RF-016 | Ninguno | |
| RF-018 | Consulta de documentos | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Permite al empleado consultar los documentos que ha registrado en la plataforma. | Empleado | Da visibilidad al empleado sobre el estado de sus propios documentos, sin necesidad de mecanismos externos de seguimiento. | Debe (Must) | Alta | Aprobado | El empleado está autenticado y tiene al menos un documento registrado. | El empleado selecciona Mis documentos. | 1. El sistema consulta los documentos cuyo usuario responsable es el empleado autenticado. 2. El sistema muestra el listado (RF-019). | RN-01: El empleado solo visualiza documentos que él mismo registró. | CA-01: Dado un empleado con documentos registrados, cuando consulta su listado, entonces solo ve los documentos que él cargó. | RF-013 | RF-019, RF-020 | |
| RF-019 | Información del documento | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Muestra, como mínimo, el nombre del documento, identificador, fecha de registro y estado actual. | Empleado | Provee la información mínima necesaria para identificar y dar seguimiento a cada documento. | Debe (Must) | Alta | Aprobado | El empleado consultó su listado de documentos (RF-018). | El sistema muestra el listado de documentos. | 1. El sistema recupera los metadatos de cada documento. 2. El sistema los presenta en una tabla con nombre, identificador, fecha de registro y estado. | RN-01: Los campos mínimos mostrados son nombre, identificador, fecha de registro y estado. | CA-01: Dado un documento registrado, cuando se lista, entonces se muestran los cuatro campos mínimos definidos. | RF-018 | Ninguno | |
| RF-020 | Estado del documento | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Muestra para cada documento uno de los siguientes estados: Pendiente, Verificado o Alterado. | Empleado / Verificador | Da trazabilidad visual inmediata sobre el resultado de la verificación de integridad, sin requerir consultar directamente la blockchain. | Debe (Must) | Alta | Aprobado | El documento fue registrado (RF-013). | El sistema muestra la información del documento (RF-019). | 1. El sistema consulta el último resultado de verificación asociado al documento. 2. Si no existe verificación previa, el estado es Pendiente; si la última comparación coincidió, Verificado; si no coincidió, Alterado. | RN-01: El estado solo puede tomar uno de los tres valores definidos. RN-02: El estado se actualiza automáticamente según RF-034. | CA-01: Dado un documento sin verificaciones previas, cuando se consulta, entonces su estado es Pendiente. | RF-013, RF-034 | Ninguno | |
| RF-021 | Consulta de trazabilidad | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Permite al empleado consultar el historial de acciones asociadas a sus documentos. | Empleado | Da al empleado visibilidad sobre lo ocurrido con sus documentos, reforzando la confianza en el sistema (RNF-06, RNF-26). | Debe (Must) | Alta | Aprobado | El empleado tiene al menos un documento registrado. | El empleado selecciona Ver trazabilidad sobre un documento. | 1. El sistema consulta en el ledger de Hyperledger Fabric los eventos asociados al documento. 2. El sistema presenta el historial (RF-022). | RN-01: El empleado solo puede consultar la trazabilidad de los documentos que él registró. | CA-01: Dado un documento con eventos registrados, cuando el empleado consulta su trazabilidad, entonces ve el historial completo de acciones sobre ese documento. | RF-018 | RF-022 | |
| RF-022 | Información de trazabilidad | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Muestra en la trazabilidad el documento asociado, la acción realizada, el usuario responsable, el identificador de transacción (txID) generado en Hyperledger Fabric, y la fecha y hora del evento. | Empleado | El campo txID se agrega para alinear el requerimiento con RNF-27, que exige conservar el identificador de transacción como evidencia de auditoría. | Debe (Must) | Alta | Propuesto | El empleado consultó la trazabilidad de un documento (RF-021). | El sistema recupera los eventos del ledger. | 1. El sistema recupera cada evento con sus atributos (documento, acción, usuario, txID, fecha y hora). 2. El sistema los presenta en orden cronológico. | RN-01: El orden de los eventos siempre es cronológico y no puede alterarse desde la interfaz. | CA-01: Dado un documento con tres eventos registrados, cuando se consulta su trazabilidad, entonces se listan los tres eventos en orden cronológico con los cinco campos definidos. | RF-021 | Ninguno | Nota de cambio (v2): se agrega el campo txID respecto a la v1, para dar cobertura a RNF-27. |
| RF-023 | Acceso al módulo de verificación | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Permite al usuario con rol Verificador acceder al módulo de verificación de integridad documental. | Área Jurídica y de Cumplimiento (rol Verificador) | Habilita la funcionalidad central del rol Verificador, definida en el alcance funcional del proyecto. | Debe (Must) | Alta | Aprobado | El usuario está autenticado con rol Verificador. | El verificador selecciona Verificar documento en su panel. | 1. El sistema valida que el usuario tenga rol Verificador. 2. El sistema muestra el módulo de verificación. | RN-01: Solo el rol Verificador y el rol Administrador pueden acceder a este módulo (ver RF-027). | CA-01: Dado un usuario con rol Verificador autenticado, cuando accede al módulo, entonces el sistema le muestra la opción de seleccionar un documento a verificar. | RF-005 | RF-024 | |
| RF-024 | Selección del documento registrado | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Permite al verificador seleccionar un documento previamente registrado en el sistema para realizar su verificación. | Verificador | Es el primer paso del flujo de verificación de integridad documental. | Debe (Must) | Alta | Aprobado | El verificador accedió al módulo de verificación (RF-023). | El verificador busca o selecciona un documento de la lista. | 1. El sistema muestra los documentos registrados disponibles. 2. El verificador selecciona el documento a validar o ingresa su identificador. | RN-01: Solo pueden seleccionarse documentos previamente registrados en el sistema. | CA-01: Dado un documento registrado, cuando el verificador lo selecciona, entonces el sistema continúa con la validación de existencia (RF-025). | RF-023 | RF-025 | |
| RF-025 | Validación de existencia | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Consulta mediante el identificador del documento si este se encuentra previamente registrado en el sistema. | Verificador | Evita iniciar un proceso de verificación sobre un documento inexistente. | Debe (Must) | Alta | Aprobado | El verificador seleccionó o ingresó un identificador de documento (RF-024). | El sistema recibe el identificador del documento. | 1. El sistema busca el identificador en la base de datos de metadatos. 2. Si existe, continúa con RF-026; si no, muestra un mensaje de error. | RN-01: Un identificador inexistente no puede continuar el flujo de verificación. | CA-01: Dado un identificador que no existe, cuando se consulta, entonces el sistema informa que el documento no está registrado. | RF-024 | RF-026 | |
| RF-026 | Consulta de huella registrada | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Muestra al verificador la huella criptográfica registrada para el documento seleccionado. | Verificador | Es la evidencia base contra la cual se comparará la huella del documento a verificar. | Debe (Must) | Alta | Aprobado | El documento existe en el sistema (RF-025). | El sistema confirma la existencia del documento. | 1. El sistema recupera la huella registrada desde el ledger o desde el registro de metadatos. 2. El sistema la muestra al verificador conforme a RF-027. | RN-01: La huella mostrada corresponde a la registrada en el momento del registro inicial (RF-015), no a una recalculada. | CA-01: Dado un documento existente, cuando se consulta su huella, entonces el sistema muestra el hash SHA-256 registrado. | RF-025 | RF-027 | |
| RF-027 | Restricción de visualización del hash | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | La huella criptográfica completa es visible únicamente para los usuarios autorizados, de acuerdo con las reglas de acceso definidas para el rol Verificador y Administrador. | Área de TI - Seguridad de la información | Limita la exposición de información sensible conforme a RNF-08, evitando que roles no autorizados (Empleado) vean la huella completa fuera de su propio documento. | Debe (Must) | Alta | Aprobado | La huella fue recuperada (RF-026). | El sistema muestra el resultado de la consulta de huella. | 1. El sistema valida el rol del usuario autenticado. 2. Si es Verificador o Administrador, muestra la huella completa; en otro caso, la oculta o restringe. | RN-01: Solo los roles Verificador y Administrador visualizan la huella completa de cualquier documento. | CA-01: Dado un usuario con rol Empleado, cuando intenta ver la huella completa de un documento ajeno, entonces el sistema le deniega el acceso. | RF-026 | Ninguno | |
| RF-028 | Carga del documento a verificar | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Permite al verificador cargar el documento PDF que será comparado con la versión previamente registrada. | Verificador | Es el insumo necesario para generar la huella de comparación (RF-030). | Debe (Must) | Alta | Aprobado | La huella registrada fue consultada (RF-026). | El verificador selecciona Cargar documento a comparar. | 1. El sistema muestra el formulario de carga. 2. El verificador selecciona el archivo PDF. 3. El sistema ejecuta las validaciones de RF-029. | RN-01: Solo se admite un archivo por operación de verificación (equivalente a RF-010). | CA-01: Dado un archivo PDF cargado, cuando se envía, entonces el sistema inicia su validación. | RF-026 | RF-029 | |
| RF-029 | Validación del documento de comparación | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Verifica que el documento utilizado para la comparación cumpla con las restricciones de formato PDF y tamaño máximo de 20 MB. | Verificador | Aplica las mismas restricciones de RF-009 y RF-011 al documento de comparación, garantizando consistencia en el procesamiento. | Debe (Must) | Alta | Aprobado | El verificador cargó un archivo (RF-028). | El sistema recibe el archivo cargado. | 1. El sistema valida formato PDF. 2. El sistema valida tamaño ≤20 MB. 3. Si ambas validaciones pasan, continúa con RF-030. | RN-01: Un archivo que no cumpla formato o tamaño detiene el proceso de verificación. | CA-01: Dado un archivo de 30 MB, cuando se valida, entonces el sistema lo rechaza e informa el límite permitido. | RF-028 | RF-030 | |
| RF-030 | Generación de hash del documento de comparación | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Genera mediante SHA-256 la huella criptográfica del documento cargado para la verificación. | Verificador | Es el dato que se comparará contra la huella registrada (RF-031), aplicando el mismo algoritmo usado en el registro (RF-014). | Debe (Must) | Alta | Aprobado | El documento de comparación fue validado (RF-029). | El sistema confirma que el archivo es válido. | 1. El sistema procesa el contenido del archivo con SHA-256. 2. El sistema obtiene la huella del documento cargado. | RN-01: La huella se calcula con el mismo algoritmo y parámetros utilizados en el registro original (RF-014). | CA-01: Dado un documento de comparación válido, cuando se procesa, entonces el sistema obtiene su huella SHA-256. | RF-029 | RF-031 | |
| RF-031 | Comparación de huellas | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Permite al verificador ejecutar la comparación entre la huella criptográfica registrada y la huella generada a partir del documento cargado. | Verificador | Es la operación central de verificación de integridad documental del sistema. | Debe (Must) | Alta | Aprobado | Se cuenta con la huella registrada (RF-026) y la huella del documento cargado (RF-030). | El verificador selecciona Comparar. | 1. El sistema toma ambas huellas. 2. El sistema ejecuta la comparación byte a byte de los valores hash. 3. El sistema continúa con RF-032. | RN-01: La comparación es exclusivamente entre los valores hash, nunca entre los contenidos de los archivos. | CA-01: Dado dos huellas idénticas, cuando se comparan, entonces el resultado es coinciden. CA-02: Dado dos huellas distintas, cuando se comparan, entonces el resultado es no coinciden. | RF-026, RF-030 | RF-032 | |
| RF-032 | Resultado de la verificación | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Determina automáticamente el resultado de la comparación y muestra si la integridad del documento es confirmada o comprometida. | Verificador | Traduce el resultado técnico de la comparación (RF-031) en un mensaje comprensible para el usuario, conforme a RNF-15. | Debe (Must) | Alta | Aprobado | La comparación fue ejecutada (RF-031). | El sistema concluye la comparación de huellas. | 1. El sistema evalúa el resultado de la comparación. 2. Si las huellas coinciden, muestra Integridad confirmada; si no coinciden, muestra Integridad comprometida. | RN-01: El resultado solo puede ser confirmada o comprometida, sin estados intermedios. | CA-01: Dado un resultado de comparación positivo, cuando se muestra, entonces el mensaje indica integridad confirmada. | RF-031 | RF-033, RF-034 | |
| RF-033 | Visualización de evidencia | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Muestra al verificador la huella criptográfica original y la huella criptográfica obtenida del documento actual como evidencia del resultado de la comparación. | Verificador | Refuerza el valor probatorio del resultado al exhibir ambas evidencias, en línea con RNF-17. | Debería (Should) | Media | Aprobado | El resultado de la verificación fue determinado (RF-032). | El sistema muestra el resultado de la verificación. | 1. El sistema presenta lado a lado la huella original y la huella obtenida. 2. El verificador puede revisar ambos valores. | RN-01: Ambas huellas se muestran completas cuando el usuario tiene el rol autorizado (RF-027). | CA-01: Dado un resultado de verificación, cuando se visualiza, entonces se muestran ambas huellas comparadas. | RF-032 | Ninguno | |
| RF-034 | Actualización del estado | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Actualiza automáticamente el estado del documento a Verificado cuando las huellas coincidan o a Alterado cuando las huellas sean diferentes. | Verificador / Empleado | Mantiene consistente el estado visible del documento (RF-020) con el resultado real de la última verificación. | Debe (Must) | Alta | Aprobado | El resultado de la verificación fue determinado (RF-032). | El sistema concluye la evaluación del resultado. | 1. El sistema toma el resultado de la comparación. 2. El sistema actualiza el campo estado del documento en la base de datos. | RN-01: El estado se actualiza automáticamente; no puede modificarse manualmente por ningún rol. | CA-01: Dado un resultado no coinciden, cuando se procesa, entonces el estado del documento cambia a Alterado. | RF-032 | Ninguno | |
| RF-035 | Registro de la verificación | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Registra en la trazabilidad la acción de verificación, el usuario que la realizó, la fecha y hora, el identificador de transacción (txID) generado en Hyperledger Fabric, y el resultado obtenido. | Verificador | El campo txID se agrega por la misma razón indicada en RF-022, para dar soporte a RNF-27. | Debe (Must) | Alta | Propuesto | El estado del documento fue actualizado (RF-034). | El sistema concluye la actualización de estado. | 1. El sistema envía al chaincode el evento de verificación con su resultado. 2. El chaincode registra el evento en el ledger y retorna un txID. | RN-01: Todo proceso de verificación genera un evento en el ledger, independientemente de su resultado. | CA-01: Dado que una verificación concluyó, cuando se registra, entonces el ledger contiene el evento con su txID y resultado. | RF-034 | RF-036 | Nota de cambio (v2): se agrega el campo txID respecto a la v1. |
| RF-036 | Nueva verificación | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Proporciona una opción denominada Nueva verificación que permite iniciar un nuevo proceso de verificación. | Verificador | Facilita la operación repetida del módulo sin necesidad de reiniciar sesión, mejorando la usabilidad (RNF-15). | Debería (Should) | Media | Aprobado | Una verificación fue registrada (RF-035). | El verificador selecciona Nueva verificación. | 1. El sistema limpia el formulario de verificación. 2. El sistema retorna al paso de selección de documento (RF-024). | RN-01: No se conservan datos de la verificación anterior en el nuevo formulario. | CA-01: Dado que el verificador selecciona Nueva verificación, cuando confirma, entonces el sistema muestra el formulario vacío de selección de documento. | RF-035 | Ninguno | |
| RF-037 | Consulta de documentos registrados | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Permite al verificador consultar los documentos registrados en el sistema. | Verificador | Da al verificador visibilidad general para ubicar documentos a validar y dar seguimiento a su estado. | Debe (Must) | Alta | Aprobado | El verificador está autenticado. | El verificador selecciona Documentos registrados. | 1. El sistema consulta el conjunto de documentos registrados. 2. El sistema los presenta según RF-038. | RN-01: El verificador puede consultar documentos registrados por cualquier empleado, a diferencia del alcance restringido del rol Empleado (RF-018). | CA-01: Dado que el verificador accede al listado, cuando lo consulta, entonces ve todos los documentos registrados en el sistema. | RF-023 | RF-038 | |
| RF-038 | Vista de documentos del verificador | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Muestra al verificador, como mínimo, el nombre del documento, identificador, usuario responsable, fecha de registro, estado y huella criptográfica, de acuerdo con sus permisos de acceso. | Verificador | Provee la información necesaria para ubicar y auditar cualquier documento registrado en el sistema. | Debe (Must) | Alta | Aprobado | El verificador consultó el listado (RF-037). | El sistema muestra el listado de documentos. | 1. El sistema recupera los metadatos y la huella de cada documento. 2. El sistema los presenta en una tabla con los seis campos mínimos. | RN-01: La huella se muestra completa solo si el usuario está autorizado (RF-027). | CA-01: Dado un documento registrado, cuando se lista para el verificador, entonces se muestran los seis campos definidos. | RF-037, RF-027 | Ninguno | |
| RF-039 | Consulta de trazabilidad general | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Permite al verificador consultar el historial completo de acciones registradas sobre los documentos. | Verificador | Habilita la auditoría documental completa exigida por RNF-26. | Debe (Must) | Alta | Aprobado | El verificador está autenticado. | El verificador selecciona Trazabilidad general. | 1. El sistema consulta en el ledger todos los eventos registrados. 2. El sistema los presenta según RF-040. | RN-01: A diferencia del empleado (RF-021), el verificador puede consultar la trazabilidad de cualquier documento del sistema. | CA-01: Dado que el verificador accede a la trazabilidad general, cuando la consulta, entonces ve los eventos de todos los documentos registrados. | RF-023 | RF-040 | |
| RF-040 | Información de trazabilidad general | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | La trazabilidad general presenta como mínimo los campos Documento, Acción, Usuario, Identificador de transacción (txID), Fecha y Resultado. | Verificador | Se agrega el campo txID; los demás campos se mantienen igual a la v1, conforme a RNF-27. | Debe (Must) | Alta | Propuesto | El verificador consultó la trazabilidad general (RF-039). | El sistema recupera los eventos del ledger. | 1. El sistema recupera cada evento con sus seis atributos. 2. El sistema los presenta en una tabla ordenada cronológicamente. | RN-01: El orden cronológico de los eventos no puede alterarse desde la interfaz. | CA-01: Dado el conjunto de eventos del ledger, cuando se listan, entonces se muestran los seis campos definidos para cada evento. | RF-039 | Ninguno | Nota de cambio (v2): se agrega el campo txID respecto a la v1. |
| RF-041 | Panel general | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Proporciona al Administrador un panel general con información consolidada sobre el estado de los documentos registrados. | Área de TI / Administración de sistemas | Da visibilidad ejecutiva sobre el uso y el estado del sistema, apoyando la supervisión operativa. | Debería (Should) | Media | Aprobado | El administrador está autenticado. | El administrador inicia sesión. | 1. El sistema consulta las métricas consolidadas de documentos. 2. El sistema las muestra en el panel principal (RF-042). | RN-01: El panel se actualiza con datos vigentes cada vez que se consulta. | CA-01: Dado que el administrador inicia sesión, cuando accede al panel, entonces ve el resumen documental consolidado. | RF-005 | RF-042 | |
| RF-042 | Resumen documental | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | El panel general muestra como mínimo el número total de documentos registrados, documentos verificados, documentos pendientes y documentos alterados. | Área de TI / Administración de sistemas | Permite dimensionar rápidamente el estado global de la gestión documental sin recorrer cada documento individualmente. | Debería (Should) | Media | Aprobado | El administrador accedió al panel general (RF-041). | El sistema construye el panel. | 1. El sistema cuenta los documentos por cada estado (RF-020). 2. El sistema muestra los cuatro totales definidos. | RN-01: Los totales deben corresponder exactamente a la suma de documentos en cada estado. | CA-01: Dado un conjunto de documentos con distintos estados, cuando se calcula el resumen, entonces la suma de los totales por estado coincide con el total general. | RF-041, RF-020 | Ninguno | |
| RF-043 | Consulta de usuarios | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Permite al Administrador consultar los usuarios registrados en la plataforma. | Área de TI / Administración de sistemas | Es la base para la gestión del ciclo de vida de usuarios exigida por el esquema RBAC de RNF-03. | Debe (Must) | Alta | Aprobado | El administrador está autenticado. | El administrador selecciona Usuarios. | 1. El sistema consulta el listado de usuarios registrados. 2. El sistema lo presenta según RF-044. | RN-01: Solo el rol Administrador puede acceder al listado completo de usuarios. | CA-01: Dado que el administrador accede al módulo de usuarios, cuando lo consulta, entonces ve el listado completo de usuarios registrados. | RF-005 | RF-044 | Amplía el detalle funcional textual del alcance del proyecto (2.6.1), que no menciona explícitamente la gestión de usuarios; se recomienda documentarlo en el capítulo de alcance final (ver hallazgo de verificación). |
| RF-044 | Información de usuarios | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Muestra para cada usuario, como mínimo, su identificador, nombre, rol, correo electrónico y estado (Activo / Inactivo). | Área de TI / Administración de sistemas | Provee la información mínima para gestionar el ciclo de vida de cada usuario (creación, edición, desactivación). | Debe (Must) | Alta | Aprobado | El administrador consultó el listado de usuarios (RF-043). | El sistema muestra el listado de usuarios. | 1. El sistema recupera los atributos de cada usuario. 2. El sistema los presenta en una tabla con los cinco campos mínimos. | RN-01: El estado de cada usuario solo puede ser Activo o Inactivo. | CA-01: Dado un usuario registrado, cuando se lista, entonces se muestran los cinco campos definidos. | RF-043 | Ninguno | |
| RF-045 | Creación de usuarios | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Permite al Administrador registrar nuevos usuarios en la plataforma. | Área de TI / Administración de sistemas | Es necesaria para incorporar empleados y verificadores al sistema conforme a los tres roles definidos (RF-001). | Debe (Must) | Alta | Aprobado | El administrador accedió al módulo de usuarios (RF-043). | El administrador selecciona Crear usuario. | 1. El sistema muestra el formulario de creación (nombre, correo, rol). 2. El administrador diligencia los datos y confirma. 3. El sistema crea el usuario en estado Activo. | RN-01: El rol asignado al usuario debe ser uno de los tres roles predefinidos del sistema (Empleado, Verificador, Administrador). RN-02: El correo electrónico no puede repetirse entre usuarios. | CA-01: Dado un correo ya registrado, cuando se intenta crear el usuario, entonces el sistema muestra un aviso de duplicidad. | RF-043 | RF-046, RF-047 | |
| RF-046 | Edición de usuarios | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Permite al Administrador modificar el nombre, correo electrónico y rol de los usuarios registrados. | Área de TI / Administración de sistemas | Permite mantener actualizada la información de los usuarios ante cambios organizacionales (por ejemplo, cambio de rol o de correo corporativo). | Debería (Should) | Media | Aprobado | El usuario a editar existe en el sistema (RF-044). | El administrador selecciona Editar sobre un usuario. | 1. El sistema muestra el formulario con los datos actuales. 2. El administrador modifica los campos permitidos. 3. El sistema guarda los cambios. | RN-01: El rol modificado debe ser uno de los tres roles predefinidos del sistema (RN-01 de RF-045), para no contradecir el RBAC cerrado de RNF-03. | CA-01: Dado un usuario existente, cuando el administrador modifica su rol, entonces el cambio se refleja en el siguiente inicio de sesión de ese usuario. | RF-045 | Ninguno | |
| RF-047 | Desactivación de usuarios | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Permite al Administrador desactivar el acceso de un usuario registrado (baja lógica), sin eliminar físicamente su información ni afectar la trazabilidad histórica asociada a sus acciones previas. | Área de TI / Administración de sistemas | Requerimiento nuevo (v2). Complementa RF-045/RF-046 y da cobertura completa al ciclo de vida de usuarios exigido por el esquema RBAC de RNF-03. | Debe (Must) | Alta | Propuesto | El usuario a desactivar existe en el sistema (RF-044). | El administrador selecciona Desactivar sobre un usuario. | 1. El sistema solicita confirmación. 2. El administrador confirma. 3. El sistema cambia el estado del usuario a Inactivo, conservando su historial. | RN-01: Un usuario inactivo no puede autenticarse (RF-005). RN-02: La baja es lógica; no se elimina el registro ni los eventos de trazabilidad previos asociados al usuario. | CA-01: Dado un usuario activo con documentos previamente registrados, cuando se desactiva, entonces conserva su historial de trazabilidad y ya no puede iniciar sesión. | RF-045 | Ninguno | Nota de cambio (v2): requerimiento nuevo respecto a la v1. |
| RF-048 | Consulta administrativa de documentos | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Permite al Administrador consultar los documentos registrados en el sistema. | Área de TI / Administración de sistemas | Da al administrador visibilidad completa para labores de supervisión y soporte del sistema. | Debe (Must) | Alta | Aprobado | El administrador está autenticado. | El administrador selecciona Documentos. | 1. El sistema consulta el conjunto completo de documentos registrados. 2. El sistema los presenta según RF-049. | RN-01: El administrador puede consultar cualquier documento registrado en el sistema. | CA-01: Dado que el administrador accede al listado, cuando lo consulta, entonces ve todos los documentos registrados. | RF-005 | RF-049 | |
| RF-049 | Vista administrativa de documentos | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Muestra al Administrador, como mínimo, el nombre del documento, identificador, usuario responsable, fecha de registro, estado y huella criptográfica, respetando las restricciones de privacidad definidas para la información. | Área de TI / Administración de sistemas | Equipara el nivel de información disponible para el administrador con el del verificador (RF-038), preservando las restricciones de privacidad de RNF-08. | Debe (Must) | Alta | Aprobado | El administrador consultó el listado (RF-048). | El sistema muestra el listado de documentos. | 1. El sistema recupera los metadatos y la huella de cada documento. 2. El sistema los presenta con los seis campos mínimos. | RN-01: No se muestra el contenido del documento, solo sus metadatos y huella (RNF-04). | CA-01: Dado un documento registrado, cuando se lista para el administrador, entonces se muestran los seis campos definidos, sin exponer el contenido del archivo. | RF-048 | Ninguno | |
| RF-050 | Consulta de trazabilidad administrativa | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Permite al Administrador consultar el registro histórico de las acciones realizadas sobre los documentos. | Área de TI / Administración de sistemas | Habilita la auditoría completa del sistema desde una perspectiva administrativa, conforme a RNF-26. | Debe (Must) | Alta | Aprobado | El administrador está autenticado. | El administrador selecciona Trazabilidad. | 1. El sistema consulta en el ledger todos los eventos registrados. 2. El sistema los presenta según RF-051. | RN-01: El administrador puede consultar la trazabilidad de cualquier documento del sistema. | CA-01: Dado que el administrador accede a la trazabilidad, cuando la consulta, entonces ve los eventos de todos los documentos registrados. | RF-005 | RF-051 | |
| RF-051 | Registro administrativo de trazabilidad | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Presenta la trazabilidad mediante una tabla que contiene, como mínimo, el identificador del documento, acción realizada, usuario responsable, identificador de transacción (txID) generado en Hyperledger Fabric, fecha y hora, y resultado obtenido. | Área de TI / Administración de sistemas | Se agregan los campos txID y Resultado; este último iguala el nivel de información que ya recibía el rol Verificador en RF-040, evitando que el panel de Administrador mostrara menos datos que un rol de menor jerarquía. | Debe (Must) | Alta | Propuesto | El administrador consultó la trazabilidad (RF-050). | El sistema recupera los eventos del ledger. | 1. El sistema recupera cada evento con sus atributos. 2. El sistema los presenta en una tabla ordenada cronológicamente con los seis campos definidos. | RN-01: El nivel de detalle mostrado al administrador debe ser igual o mayor al mostrado al verificador (RF-040). | CA-01: Dado el conjunto de eventos del ledger, cuando se listan para el administrador, entonces se muestran los seis campos definidos, incluyendo txID y Resultado. | RF-050 | Ninguno | Nota de cambio (v2): se agregan los campos txID y Resultado respecto a la v1. |
| RF-052 | Cambio de contraseña | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Permite a los usuarios autenticados cambiar su contraseña. | Todos los roles (Empleado, Verificador, Administrador) | Es una práctica básica de higiene de seguridad que complementa la protección de contraseñas exigida en RNF-01. | Debería (Should) | Media | Aprobado | El usuario tiene una sesión activa. | El usuario selecciona Cambiar contraseña. | 1. El sistema muestra el formulario de cambio de contraseña. 2. El usuario lo diligencia y confirma. 3. El sistema ejecuta las validaciones de RF-053. | RN-01: La nueva contraseña debe cumplir los requisitos mínimos de complejidad definidos por el sistema. | CA-01: Dado un usuario autenticado, cuando accede a la opción de cambio de contraseña, entonces el sistema muestra el formulario correspondiente. | RF-005 | RF-053 | |
| RF-053 | Validación de cambio de contraseña | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Solicita la contraseña actual y la nueva contraseña antes de realizar el cambio, validando que la operación sea realizada por el usuario autenticado. | Todos los roles | Evita que un tercero con sesión abierta cambie la contraseña sin conocer la contraseña vigente. | Debería (Should) | Media | Aprobado | El usuario accedió al formulario de cambio de contraseña (RF-052). | El usuario envía el formulario con contraseña actual y nueva. | 1. El sistema valida que la contraseña actual ingresada coincida con la almacenada. 2. Si coincide, el sistema aplica el hash a la nueva contraseña y la almacena (RNF-01). 3. El sistema confirma el cambio. | RN-01: Si la contraseña actual ingresada no coincide, el sistema rechaza el cambio. | CA-01: Dado que la contraseña actual ingresada es incorrecta, cuando se envía el formulario, entonces el sistema rechaza el cambio e informa el error. | RF-052 | Ninguno | No existe en el SRS un requerimiento de recuperación de contraseña olvidada (sin sesión activa); se recomienda evaluar si se incluye en el MVP o se documenta como limitación (ver hallazgo de verificación). |

## RNF
| Requisitos no funcionales |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Una fila por requisito. La característica de calidad se deriva de la subcaracterística elegida (ISO/IEC 25010:2023). | | | | | | | | | | | | | | | | | | | | |
| La fila 7 es un ejemplo: sobrescríbela o bórrala antes de entregar. Sin métrica, unidad y umbral el requisito no es verificable. | | | | | | | | | | | | | | | | | | | | |
| | | | | | | | | | | | | | | | | | | | | |
| IDENTIFICACIÓN | | | | | 1. CONTEXTO Y JUSTIFICACIÓN | | | 2. CLASIFICACIÓN | | | | | 3. ESPECIFICACIÓN DE LA MEDIDA | | | | | 4. RELACIONES | | |
| ID del requisito | Título | Versión | Fecha de versión | Autor | Descripción general | Fuente o parte interesada | Justificación | Característica ISO/IEC 25010:2023 | Subcaracterística ISO/IEC 25010:2023 | Prioridad (MoSCoW) | Importancia | Estado | Métrica | Unidad de medida | Umbral de aceptación | Condición de medición | Método de verificación | Requisitos funcionales afectados | Dependencias | Comentarios |
| RNF-001 | Protección de contraseñas mediante hashing seguro | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Las contraseñas se almacenan utilizando un mecanismo de hashing seguro con sal, nunca en texto plano. | Área de TI - Seguridad de la información | Previene la exposición de credenciales ante un acceso no autorizado a la base de datos, conforme a buenas prácticas de seguridad de la información referenciadas en el Anexo A de ISO/IEC 27001:2022 [23]. | Seguridad (security) | Confidencialidad | Debe (Must) | Alta | Aprobado | Verificación binaria de que el campo de contraseña almacenado corresponde a un hash con sal (no a texto plano) | Cumple / No cumple | Cumple (100 % de las contraseñas almacenadas como hash con sal, mediante bcrypt) | Inspección de la base de datos de usuarios en el entorno de pruebas Docker | Inspección | RF-002, RF-045, RF-052, RF-053 | Ninguna | BCRYPT incorpora automáticamente sal y múltiples iteraciones, según se define en el glosario del proyecto. |
| RNF-002 | Autenticación de doble factor | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | El sistema implementa autenticación mediante credenciales y un segundo factor de verificación mediante token. | Área de TI - Seguridad de la información | Se mantiene sin cambios respecto a la v1, sujeta a la misma validación pendiente indicada en RF-003 sobre el canal exclusivo de token por correo, y se alinea con el Decreto 2364 de 2012, que reconoce la validez de mecanismos tecnológicos de autenticación como la firma electrónica [36]. | Seguridad (security) | Autenticidad | Debe (Must) | Alta | Propuesto | Verificación de que el acceso requiere credenciales válidas y un token de segundo factor vigente | Cumple / No cumple | Cumple (100 % de los inicios de sesión exigen ambos factores) | Prueba funcional del flujo de autenticación (RF-002 a RF-005) en el entorno Docker de pruebas | Prueba | RF-002, RF-003, RF-004, RF-005 | Ninguna | Pendiente de validar con el tutor si el canal exclusivo de correo corporativo es suficiente o si se debe evaluar un canal alterno. |
| RNF-003 | Control de acceso basado en roles (RBAC) | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | El sistema aplica un esquema de control de acceso basado en roles, garantizando que cada usuario únicamente pueda acceder a las funcionalidades y datos autorizados para su rol. | Área de TI - Seguridad de la información | Es un control fundamental de acceso lógico alineado con el Anexo A de ISO/IEC 27001:2022, tomado como referencia de diseño en el proyecto [23]. | Seguridad (security) | Confidencialidad | Debe (Must) | Alta | Aprobado | Porcentaje de intentos de acceso a funcionalidades no autorizadas para el rol que son bloqueados | Porcentaje (%) | 100 % de los intentos no autorizados bloqueados | Suite de pruebas funcionales de caja negra ejecutando los tres roles sobre los cinco módulos del sistema | Prueba | RF-001, RF-005, RF-006, RF-023, RF-027, RF-041 a RF-051 | RNF-002 | |
| RNF-004 | No almacenamiento del contenido documental en blockchain | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | El sistema no almacena el contenido de los contratos laborales ni acuerdos de confidencialidad directamente en la red blockchain. La blockchain almacena únicamente las huellas criptográficas y los eventos necesarios para la trazabilidad. | Alcance técnico del proyecto | Corresponde directamente al modelo de persistencia definido en el proyecto y responde a las exigencias de minimización de datos de la Ley 1581 de 2012 [9]. | Seguridad (security) | Confidencialidad | Debe (Must) | Alta | Aprobado | Verificación de que ningún registro del ledger contiene el contenido binario o textual del documento | Cumple / No cumple | Cumple (0 documentos con contenido almacenado en el ledger) | Inspección del ledger de Hyperledger Fabric tras el registro de los 20 documentos sintéticos de prueba | Inspección | RF-013, RF-016 | Ninguna | |
| RNF-005 | Inmutabilidad de las huellas registradas | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Las huellas criptográficas registradas en la blockchain se conservan de manera inmutable, de forma que no puedan ser modificadas mediante las operaciones normales del sistema. | Alcance técnico del proyecto | Es la propiedad central de la infraestructura blockchain permisionada, base de la validez probatoria exigida por la Ley 527 de 1999 [10]. La reciente jurisprudencia de la Corte Suprema de Justicia (Sentencia SP248-2025) confirma que la ausencia de un hash no invalida la evidencia digital, pero sí afecta su fuerza probatoria, lo que refuerza la importancia de este control [7]. | Seguridad (security) | Integridad | Debe (Must) | Alta | Aprobado | Porcentaje de intentos de modificación de una huella ya registrada que son rechazados por el sistema | Porcentaje (%) | 100 % de los intentos de modificación rechazados | Pruebas de mutación documental sobre los 20 documentos sintéticos, intentando alterar registros ya confirmados en el ledger | Prueba | RF-016, RF-026 | Ninguna | |
| RNF-006 | Registro de operaciones relevantes | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | El sistema registra las operaciones relevantes realizadas sobre los documentos, incluyendo usuario, acción, fecha, hora y resultado cuando corresponda. | Alcance técnico del proyecto | Sustenta la trazabilidad documental exigida por el alcance del proyecto y por RNF-26. | Seguridad (security) | Rendición de cuentas | Debe (Must) | Alta | Aprobado | Porcentaje de operaciones sobre documentos (registro, verificación) que generan un evento de trazabilidad | Porcentaje (%) | 100 % de las operaciones generan evento de trazabilidad | Prueba de trazabilidad e inmutabilidad, comparando las acciones ejecutadas contra el historial recuperado del ledger | Prueba | RF-016, RF-035 | RNF-005 | |
| RNF-007 | Gestión segura de sesiones | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | El sistema gestiona las sesiones de usuario de manera segura e impide el acceso a funcionalidades protegidas una vez finalizada la sesión. | Área de TI - Seguridad de la información | Complementa el control de acceso (RNF-03) evitando el uso de sesiones expiradas o cerradas para acceder a información sensible. | Seguridad (security) | Confidencialidad | Debe (Must) | Alta | Aprobado | Verificación de que una sesión cerrada o expirada no permite acceder a funcionalidades protegidas | Cumple / No cumple | Cumple (0 accesos exitosos con sesión cerrada o expirada) | Prueba funcional de caja negra sobre RF-007, cerrando sesión e intentando acceder a rutas protegidas | Prueba | RF-007 | RNF-002 | |
| RNF-008 | Limitación de exposición de información documental | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | El sistema limita la exposición de información documental y de las huellas criptográficas de acuerdo con los permisos establecidos para cada rol. | Área de TI - Seguridad de la información | Da cumplimiento a los principios de finalidad y minimización de la Ley 1581 de 2012 [9] y a los lineamientos de la Circular Externa 005 de 2017 de la Superintendencia de Industria y Comercio [8], además del control A.8.24 del Anexo A de ISO/IEC 27001:2022 [23]. | Seguridad (security) | Confidencialidad | Debe (Must) | Alta | Aprobado | Porcentaje de campos restringidos (huella completa, datos de otros usuarios) que no son visibles para roles no autorizados | Porcentaje (%) | 100 % de los campos restringidos ocultos para roles no autorizados | Prueba funcional de caja negra sobre RF-018, RF-027 y RF-038 con los tres roles | Prueba | RF-018, RF-027, RF-038, RF-049 | RNF-003 | |
| RNF-009 | Tiempo de respuesta de las operaciones principales | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | El sistema responde a las operaciones principales de consulta y verificación en un tiempo adecuado para garantizar una interacción fluida con el usuario. | Verificador / Empleado | Sustenta la usabilidad general del sistema (RNF-15) y se detalla de forma cuantitativa en RNF-10 para la operación crítica de verificación. | Eficiencia de desempeño | Comportamiento temporal | Debería (Should) | Media | Aprobado | Tiempo de respuesta percibido en las operaciones de consulta de documentos y trazabilidad | Milisegundos (ms) | Menor o igual a 3.000 ms | 50 peticiones consecutivas sobre el entorno Docker local de pruebas | Prueba | RF-018, RF-021, RF-037, RF-039 | Ninguna | Se alinea con el mismo umbral definido para RNF-10, tomado del KPI del proyecto (Tabla 1). |
| RNF-010 | Latencia de la verificación de integridad | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | La operación de verificación de integridad cumple como meta un percentil 95 de latencia igual o inferior a 3.000 ms en 50 peticiones consecutivas, de acuerdo con el KPI definido en el proyecto. | KPI OE3 del proyecto (Tabla 1) | Corresponde directamente al KPI Percentil 95 (P95) de latencia del endpoint de verificación definido para el objetivo específico de desarrollo del MVP. | Eficiencia de desempeño | Comportamiento temporal | Debe (Must) | Alta | Aprobado | Percentil 95 (P95) de la latencia del endpoint de verificación (RF-031) | Milisegundos (ms) | P95 ≤ 3.000 ms | 50 peticiones consecutivas sobre el endpoint de verificación en el entorno Docker local | Prueba | RF-028 a RF-034 | RNF-009 | |
| RNF-011 | Automatización del cálculo de huellas | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | La generación y comparación de las huellas SHA-256 se realiza de manera automática sin requerir intervención manual del usuario. | Alcance técnico del proyecto | Reduce el riesgo de error humano en el cálculo de la evidencia de integridad, reforzando la propiedad de efecto avalancha de SHA-256 [34]. | Eficiencia de desempeño | Comportamiento temporal | Debe (Must) | Alta | Aprobado | Verificación de que el usuario no ejecuta ningún paso manual durante el cálculo o la comparación de huellas | Cumple / No cumple | Cumple (0 pasos manuales requeridos en el cálculo de huellas) | Revisión del flujo de RF-014 y RF-030 en el entorno de pruebas | Inspección | RF-014, RF-030 | Ninguna | |
| RNF-012 | Disponibilidad durante el periodo de pruebas | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | El sistema permanece disponible durante el periodo definido para las pruebas y validación del MVP. | Alcance del proyecto (despliegue en Microsoft Azure) | El despliegue en Azure se realiza durante un periodo de prueba de un mes; su disponibilidad es necesaria para ejecutar el plan de pruebas de software (PPS). | Fiabilidad | Disponibilidad | Debería (Should) | Media | Aprobado | Porcentaje de tiempo en que el sistema responde correctamente durante el periodo de validación | Porcentaje (%) | Mayor o igual a 95 % durante el mes de pruebas | Monitoreo del entorno desplegado en la máquina virtual de Azure durante la fase 4 del proyecto | Prueba | Todos los módulos funcionales | Ninguna | No aplica para un entorno productivo; corresponde exclusivamente a la validación del MVP. |
| RNF-013 | Consistencia entre MongoDB y Hyperledger Fabric | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | La información registrada en la base de datos no relacional (MongoDB) y la evidencia almacenada en la red blockchain permisionada (Hyperledger Fabric) mantienen correspondencia respecto a los documentos, identificadores y eventos registrados. | Alcance técnico del proyecto | Se reemplaza el término genérico base de datos por base de datos no relacional (MongoDB) y se nombra explícitamente Hyperledger Fabric, para anclar el requerimiento al marco tecnológico definido en el proyecto. | Adecuación funcional | Corrección funcional | Debe (Must) | Alta | Propuesto | Porcentaje de documentos cuyo identificador y huella coinciden entre MongoDB y el ledger de Hyperledger Fabric | Porcentaje (%) | 100 % de correspondencia | Comparación cruzada de los 20 documentos sintéticos entre la base de datos y el ledger, al cierre de las pruebas de integridad | Prueba | RF-013, RF-015, RF-016 | Ninguna | Nota de cambio (v2) respecto a la v1. |
| RNF-014 | Detección de alteraciones documentales | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | El sistema detecta las alteraciones realizadas sobre los documentos utilizados durante las pruebas de integridad. Como meta del proyecto, debe detectar el 100 % de las alteraciones realizadas sobre los 20 documentos definidos para la validación. | KPI OE4 del proyecto (Tabla 1) | Corresponde directamente al KPI Tasa de detección de alteraciones documentales y se respalda en los resultados reportados por Mier Bello et al., quienes lograron una tasa de detección del 100 % en un sistema análogo basado en blockchain [30]. | Adecuación funcional | Corrección funcional | Debe (Must) | Alta | Aprobado | Tasa de detección de alteraciones sobre el conjunto de documentos sintéticos alterados | Porcentaje (%) | 100 % de los 20 documentos alterados detectados como no íntegros | Pruebas de mutación documental (cambios en texto, firmas y metadatos) sobre los 20 documentos sintéticos definidos en el plan de pruebas | Prueba | RF-031, RF-032, RF-034 | RNF-005 | |
| RNF-015 | Usabilidad sin conocimientos especializados | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | La interfaz permite que los usuarios ejecuten las operaciones correspondientes a su rol de manera clara e intuitiva, sin requerir conocimientos especializados sobre blockchain o criptografía. | Empleado / Verificador / Administrador | El sistema está dirigido a personal administrativo y jurídico sin formación técnica en blockchain, por lo que la interfaz debe abstraer la complejidad subyacente. | Capacidad de interacción | Operabilidad | Debería (Should) | Media | Aprobado | Porcentaje de tareas principales (carga, verificación, consulta) completadas sin asistencia por usuarios de prueba | Porcentaje (%) | Mayor o igual a 90 % de tareas completadas sin asistencia | Prueba de usabilidad con usuarios representativos de cada rol sobre el prototipo de alta fidelidad | Demostración | RF-008, RF-024, RF-031 | Ninguna | |
| RNF-016 | Consistencia visual y de navegación | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | El sistema mantiene una estructura visual y de navegación consistente entre los diferentes módulos. | Equipo de diseño UX/UI | Reduce la curva de aprendizaje entre módulos y refuerza la usabilidad general del sistema (RNF-15). | Capacidad de interacción | Reconocibilidad de la adecuación | Podría (Could) | Baja | Aprobado | Verificación de que los componentes de navegación y estilo se reutilizan entre los módulos de Empleado, Verificador y Administrador | Cumple / No cumple | Cumple (mismo sistema de diseño aplicado en los tres paneles) | Revisión de los prototipos de Figma frente a la interfaz implementada | Inspección | RF-006 | Ninguna | |
| RNF-017 | Retroalimentación sobre el resultado de las operaciones | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | El sistema informa claramente al usuario sobre el resultado de las operaciones realizadas, incluyendo cargas exitosas, errores de validación, resultados de verificación y cambios de estado. | Empleado / Verificador | Es necesaria para que el usuario confíe en el resultado de operaciones críticas como la verificación de integridad (RF-032). | Capacidad de interacción | Operabilidad | Debería (Should) | Media | Aprobado | Porcentaje de operaciones principales que muestran un mensaje de resultado al usuario | Porcentaje (%) | 100 % de las operaciones principales muestran retroalimentación | Prueba funcional de caja negra sobre los cinco módulos del sistema | Prueba | RF-017, RF-032, RF-033 | Ninguna | |
| RNF-018 | Claridad de los mensajes de error | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Los mensajes de error son claros e indican al usuario la causa del problema y, cuando sea posible, la acción requerida para solucionarlo. | Empleado / Verificador / Administrador | Complementa RNF-17 evitando que el usuario deba interpretar códigos de error técnicos. | Capacidad de interacción | Protección frente a errores de usuario | Podría (Could) | Baja | Aprobado | Porcentaje de mensajes de error que incluyen causa y acción sugerida | Porcentaje (%) | 100 % de los mensajes de error revisados cumplen el formato definido | Revisión de catálogo de mensajes de error frente a los casos de prueba de validación (RF-009, RF-011, RF-025) | Inspección | RF-009, RF-011, RF-025 | RNF-017 | |
| RNF-019 | Separación de responsabilidades por capas | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | El sistema implementa una arquitectura modular que permite separar las responsabilidades de presentación, lógica de aplicación, integración con blockchain y persistencia. | Equipo de arquitectura del proyecto | Corresponde al diseño de capas (Presentación, Aplicación, Blockchain, Persistencia) definido en la fase de diseño de arquitectura del proyecto. | Mantenibilidad | Modularidad | Debe (Must) | Alta | Aprobado | Verificación de que cada capa se implementa en un componente independiente y documentado en el diagrama de arquitectura | Cumple / No cumple | Cumple (4 de 4 capas separadas y documentadas) | Revisión de los diagramas UML de componentes frente a la implementación | Inspección | Todos los módulos funcionales | Ninguna | |
| RNF-020 | Integración indirecta con Hyperledger Fabric | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | La comunicación entre el sistema web y Hyperledger Fabric se realiza mediante el backend, evitando que el frontend interactúe directamente con la infraestructura blockchain. | Equipo de arquitectura del proyecto | Esta separación está contemplada en la arquitectura propuesta en el documento y sigue el patrón de uso del Fabric SDK descrito por la documentación oficial de Hyperledger Fabric [19]. | Mantenibilidad | Modularidad | Debe (Must) | Alta | Aprobado | Verificación de que ninguna llamada del frontend se dirige directamente a los nodos de la red blockchain | Cumple / No cumple | Cumple (0 llamadas directas del frontend a la red Hyperledger Fabric) | Inspección del código fuente y de las trazas de red del frontend durante las pruebas funcionales | Inspección | RF-016, RF-026, RF-031 | RNF-019 | |
| RNF-021 | Despliegue mediante contenedores Docker | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Los componentes de la solución pueden ejecutarse mediante contenedores Docker y Docker Compose, de acuerdo con la arquitectura de despliegue definida para el MVP. | Equipo de arquitectura del proyecto | Es el mecanismo de contención y orquestación definido en el alcance técnico del proyecto para el entorno de prueba de un mes en Azure. | Flexibilidad | Capacidad de instalación | Debe (Must) | Alta | Aprobado | Porcentaje de componentes del sistema (frontend, backend, chaincode, red Hyperledger Fabric, MongoDB) desplegados como contenedores Docker | Porcentaje (%) | 100 % de los componentes contenerizados | Revisión del archivo docker-compose.yml y verificación de arranque completo del entorno | Demostración | Todos los módulos funcionales | RNF-019 | |
| RNF-022 | Extensibilidad de la arquitectura | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | La arquitectura permite la incorporación futura de nuevos módulos o funcionalidades sin requerir una modificación completa de los componentes existentes. | Equipo de arquitectura del proyecto | Da continuidad al proyecto más allá del MVP, permitiendo evoluciones futuras sin rediseño total del sistema, dentro de las limitaciones declaradas (no se evalúa escalabilidad de producción). | Mantenibilidad | Modificabilidad | Podría (Could) | Baja | Aprobado | Verificación cualitativa, mediante revisión arquitectónica, de que un nuevo módulo puede incorporarse sin modificar los módulos existentes | Cumple / No cumple | Cumple (revisión arquitectónica sin observaciones críticas) | Revisión de arquitectura con el director del proyecto (hito de Fase 2) | Análisis | Ninguno directamente | RNF-019 | |
| RNF-023 | Compatibilidad exclusiva con PDF | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | El sistema es compatible exclusivamente con documentos en formato PDF dentro del alcance definido para el MVP. | Alcance y limitaciones del proyecto | Corresponde a la limitación funcional del proyecto, que excluye otros formatos como DOCX, XML o imágenes. | Compatibilidad | Interoperabilidad | Debe (Must) | Alta | Aprobado | Porcentaje de formatos distintos a PDF rechazados por el sistema | Porcentaje (%) | 100 % de los formatos no PDF rechazados | Prueba funcional de carga con archivos en formatos DOCX, XML e imágenes | Prueba | RF-009, RF-029 | Ninguna | |
| RNF-024 | Límite de tamaño de archivo | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | El sistema soporta documentos de hasta 20 MB por archivo. | Decisión técnica del equipo de desarrollo | Es un umbral de diseño definido por el equipo para preservar el rendimiento de las operaciones de hashing (RNF-09, RNF-11), sin corresponder a una norma externa. | Eficiencia de desempeño | Capacidad | Debe (Must) | Alta | Aprobado | Tamaño máximo de archivo aceptado por el sistema | Megabytes (MB) | Máximo 20 MB por archivo | Prueba funcional de carga con archivos de 19 MB, 20 MB y 21 MB | Prueba | RF-011, RF-029 | Ninguna | |
| RNF-025 | Accesibilidad mediante navegadores modernos | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | El sistema es accesible mediante navegadores web modernos que soporten las tecnologías utilizadas para el desarrollo de la aplicación. | Empleado / Verificador / Administrador | Garantiza el acceso al sistema desde los navegadores estándar disponibles en los equipos de cómputo de la organización. | Flexibilidad | Adaptabilidad | Podría (Could) | Baja | Aprobado | Número de navegadores modernos (últimas dos versiones estables) en los que el sistema opera sin errores funcionales | Navegadores compatibles | Mínimo 2 navegadores modernos verificados (por ejemplo, Chrome y Edge) | Prueba funcional manual sobre los navegadores seleccionados en el entorno de pruebas | Prueba | Todos los módulos funcionales | Ninguna | |
| RNF-026 | Reconstrucción cronológica de acciones | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | El sistema permite reconstruir cronológicamente las acciones realizadas sobre cada documento mediante los registros de trazabilidad. | Área Jurídica y de Cumplimiento | Sustenta el valor probatorio de la trazabilidad documental, en línea con la Ley 527 de 1999 [10] y la ISO 15489-1:2016 sobre gestión de registros [22]. | Seguridad (security) | Rendición de cuentas | Debe (Must) | Alta | Aprobado | Porcentaje de documentos cuyo historial de eventos puede reconstruirse en orden cronológico completo | Porcentaje (%) | 100 % de los 20 documentos con historial reconstruible | Prueba de trazabilidad e inmutabilidad sobre el conjunto de documentos sintéticos | Prueba | RF-021, RF-022, RF-039, RF-040, RF-050, RF-051 | RNF-006 | |
| RNF-027 | Conservación del orden y del identificador de transacción | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | Los eventos registrados en la red blockchain conservan su orden cronológico e identificador de transacción para facilitar su auditoría y consulta. | Alcance técnico del proyecto | Es la propiedad que exige agregar el campo txID en RF-022, RF-035, RF-040 y RF-051, conforme a las notas de cambio de la versión 2 del SRS. | Seguridad (security) | No repudio | Debe (Must) | Alta | Aprobado | Porcentaje de eventos del ledger que conservan un txID único y un orden cronológico verificable | Porcentaje (%) | 100 % de los eventos con txID único y orden cronológico correcto | Prueba de trazabilidad e inmutabilidad, comparando el orden de ejecución contra el orden recuperado del ledger | Prueba | RF-016, RF-022, RF-035, RF-040, RF-051 | RNF-005 | |
| RNF-028 | Porcentaje de aprobación de la suite de pruebas | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | El sistema alcanza como mínimo un 90 % de casos de prueba funcionales aprobados (PASS) en la suite final de pruebas definida para el MVP. | KPI OE4 del proyecto (Tabla 1) | Corresponde directamente al KPI Porcentaje de casos de prueba funcionales con resultado PASS definido para el objetivo específico de evaluación del MVP. | Adecuación funcional | Corrección funcional | Debe (Must) | Alta | Aprobado | Porcentaje de casos de prueba con resultado PASS sobre el total de la suite final | Porcentaje (%) | Mayor o igual a 90 % (aproximadamente 45 de 50 casos) | Ejecución de la suite final de pruebas funcionales (5 módulos × 10 casos) | Prueba | Todos los módulos funcionales | Ninguna | |
| RNF-029 | Condiciones controladas de evaluación | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | El rendimiento y confiabilidad del sistema se evalúan bajo las condiciones controladas establecidas para el MVP, utilizando los documentos sintéticos definidos en el plan de pruebas. | Alcance y limitaciones del proyecto | El proyecto no contempla pruebas de carga a escala empresarial ni escenarios de uso concurrente masivo, conforme a las limitaciones declaradas. | Mantenibilidad | Capacidad de prueba | Debería (Should) | Media | Aprobado | Verificación de que las pruebas de rendimiento y confiabilidad se ejecutan sobre el conjunto de 20 documentos sintéticos definido | Cumple / No cumple | Cumple (pruebas ejecutadas exclusivamente sobre los 20 documentos sintéticos y el entorno Docker de prueba) | Revisión del Plan de Pruebas de Software (PPS) frente a su ejecución real | Inspección | Ninguno directamente | RNF-014, RNF-028 | |
| RNF-030 | Alineación con controles del Anexo A de ISO/IEC 27001:2022 | 2.0 | 2026-08-31 00:00:00 | Laura Sofia Diaz Suarez; Sofia Ortiz Daza | El diseño del sistema considera principios y controles de seguridad relacionados con el acceso, criptografía, integridad y protección de la información, tomando como referencia los controles definidos en el Anexo A de ISO/IEC 27001:2022 contemplados en el alcance del proyecto. | Alcance normativo del proyecto | El proyecto centra su enfoque normativo en los controles A.8.24 (uso de criptografía) y A.8.11 (enmascaramiento de datos) del Anexo A de ISO/IEC 27001:2022 [23], sin implementar ni certificar el SGSI completo. | Seguridad (security) | Confidencialidad | Debe (Must) | Alta | Aprobado | Número de controles del Anexo A adoptados como criterio de diseño (A.8.24 y A.8.11) efectivamente reflejados en la arquitectura | Controles cumplidos / controles de referencia | 2 de 2 controles de referencia (A.8.24 y A.8.11) reflejados en el diseño | Revisión de arquitectura frente a la matriz de trazabilidad normativa del proyecto | Análisis | RF-014, RF-015, RF-016, RF-027, RF-049 | RNF-004, RNF-005 | No se implementa ni evalúa el SGSI completo definido por la norma, conforme a las limitaciones del proyecto. |

## Ficha_RF
| Fichas de requisitos funcionales (RF-001 a RF-053) |  |  |
| --- | --- | --- |
| Una ficha de una página por cada requisito funcional del SRS v2, generada a partir de la hoja RF. | | |
| | | |
| Ficha de requisito funcional (1 de 53) RF-001 — Selección de rol de acceso | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-001 |
| | Título | Selección de rol de acceso |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Permite al usuario elegir, antes de autenticarse, el rol con el que iniciará sesión (Empleado, Verificador o Administrador). |
| | Fuente o parte interesada | Área de TI - Seguridad de la información |
| | Justificación | Los tres roles definen el alcance funcional del MVP y habilitan el control de acceso por rol (RBAC) exigido en RNF-03. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El usuario no tiene sesión activa. |
| | Disparador | El usuario ingresa a la URL del sistema. |
| | Flujo principal | 1. El sistema muestra las opciones Empleado, Verificador y Administrador. 2. El usuario selecciona un rol. 3. El sistema habilita el formulario de credenciales de RF-002. |
| | Reglas de negocio y validaciones | RN-01: Solo se aceptan los tres roles predefinidos del sistema. |
| | Criterios de aceptación verificables | CA-01: Dado que el usuario está en la pantalla de inicio, cuando selecciona un rol válido, entonces el sistema muestra el formulario de autenticación correspondiente. |
| | 4. RELACIONES | |
| | Dependencias | Ninguna |
| | Requisitos hijos | RF-002 |
| | Comentarios | Corresponde al alcance funcional (tres roles) definido en el proyecto. |
| | | |
| | | |
| Ficha de requisito funcional (2 de 53) RF-002 — Autenticación mediante credenciales | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-002 |
| | Título | Autenticación mediante credenciales |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Solicita usuario y contraseña corporativos como primer factor de autenticación. |
| | Fuente o parte interesada | Área de TI - Seguridad de la información |
| | Justificación | Es la base del control de acceso y se complementa con el segundo factor de RF-003, conforme a RNF-02. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El usuario seleccionó un rol (RF-001). |
| | Disparador | El usuario visualiza el formulario de credenciales. |
| | Flujo principal | 1. El sistema solicita usuario y contraseña. 2. El usuario los ingresa y envía el formulario. 3. El sistema valida las credenciales contra el registro de usuarios y continúa con RF-003. |
| | Reglas de negocio y validaciones | RN-01: Las contraseñas se validan contra el hash almacenado (RNF-01), nunca en texto plano. |
| | Criterios de aceptación verificables | CA-01: Dado credenciales válidas, cuando se envía el formulario, entonces el sistema solicita el token de segundo factor. CA-02: Dado credenciales inválidas, cuando se envía el formulario, entonces el sistema muestra un mensaje de error sin indicar cuál dato es incorrecto. |
| | 4. RELACIONES | |
| | Dependencias | RF-001 |
| | Requisitos hijos | RF-003 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (3 de 53) RF-003 — Autenticación de segundo factor | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-003 |
| | Título | Autenticación de segundo factor |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Envía un token de verificación al correo corporativo registrado del usuario como segundo factor. |
| | Fuente o parte interesada | Área de TI - Seguridad de la información |
| | Justificación | Refuerza la autenticación exigida por RNF-02 y reduce el riesgo de suplantación en el acceso a evidencia documental sensible. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | Las credenciales ingresadas en RF-002 fueron validadas. |
| | Disparador | El sistema valida correctamente usuario y contraseña. |
| | Flujo principal | 1. El sistema genera un token de un solo uso. 2. El sistema lo envía al correo corporativo registrado. 3. El sistema muestra el campo para ingresar el token. |
| | Reglas de negocio y validaciones | RN-01: El token tiene un tiempo de expiración definido y solo puede usarse una vez. |
| | Criterios de aceptación verificables | CA-01: Dado que las credenciales son válidas, cuando el sistema las procesa, entonces envía el token al correo registrado del usuario en menos de un minuto. |
| | 4. RELACIONES | |
| | Dependencias | RF-002 |
| | Requisitos hijos | RF-004 |
| | Comentarios | Pendiente de validar el canal exclusivo de correo corporativo frente a alternativas (SMS, app autenticadora); ver nota en RNF-02. |
| | | |
| | | |
| Ficha de requisito funcional (4 de 53) RF-004 — Validación del token | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-004 |
| | Título | Validación del token |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Valida el token de segundo factor ingresado por el usuario antes de conceder acceso. |
| | Fuente o parte interesada | Área de TI - Seguridad de la información |
| | Justificación | Es el paso que cierra el ciclo de autenticación de doble factor exigido en RNF-02. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El token fue enviado (RF-003). |
| | Disparador | El usuario ingresa el token recibido. |
| | Flujo principal | 1. El usuario ingresa el token. 2. El sistema compara el token ingresado contra el generado. 3. Si coincide y no ha expirado, el sistema continúa con RF-005. |
| | Reglas de negocio y validaciones | RN-01: Un token expirado o incorrecto no concede acceso. RN-02: Se define un número máximo de intentos antes de bloquear temporalmente el proceso. |
| | Criterios de aceptación verificables | CA-01: Dado un token correcto y vigente, cuando se valida, entonces el sistema concede acceso. CA-02: Dado un token incorrecto o expirado, cuando se valida, entonces el sistema deniega el acceso y lo informa al usuario. |
| | 4. RELACIONES | |
| | Dependencias | RF-003 |
| | Requisitos hijos | RF-005 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (5 de 53) RF-005 — Control de acceso por rol | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-005 |
| | Título | Control de acceso por rol |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Permite el acceso únicamente cuando credenciales, token y rol seleccionado son válidos y corresponden al usuario autenticado. |
| | Fuente o parte interesada | Área de TI - Seguridad de la información |
| | Justificación | Materializa el esquema RBAC exigido por RNF-03 al validar de forma cruzada el rol seleccionado y el rol asignado al usuario. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El token fue validado (RF-004). |
| | Disparador | El sistema concluye la validación del token. |
| | Flujo principal | 1. El sistema verifica que el rol seleccionado en RF-001 corresponda al rol asignado al usuario en la base de datos. 2. Si coinciden, el sistema concede acceso. 3. Si no coinciden, el sistema deniega el acceso. |
| | Reglas de negocio y validaciones | RN-01: Un usuario no puede acceder con un rol distinto al que tiene asignado, aunque sus credenciales sean válidas. |
| | Criterios de aceptación verificables | CA-01: Dado que el rol seleccionado no coincide con el rol asignado, cuando el sistema valida el acceso, entonces lo deniega y muestra un mensaje de error. |
| | 4. RELACIONES | |
| | Dependencias | RF-004 |
| | Requisitos hijos | RF-006 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (6 de 53) RF-006 — Redirección según rol | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-006 |
| | Título | Redirección según rol |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Muestra al usuario el panel principal y las funcionalidades correspondientes a su rol tras autenticarse. |
| | Fuente o parte interesada | Área de TI / Usuarios finales de cada rol |
| | Justificación | Garantiza que cada usuario solo visualice las funcionalidades autorizadas para su rol, en línea con RNF-08. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debería (Should) |
| | Importancia | Media |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El acceso fue concedido (RF-005). |
| | Disparador | El sistema concede el acceso. |
| | Flujo principal | 1. El sistema identifica el rol del usuario autenticado. 2. El sistema redirige al panel correspondiente (Empleado, Verificador o Administrador). |
| | Reglas de negocio y validaciones | RN-01: El contenido del panel se limita a las funcionalidades habilitadas para el rol. |
| | Criterios de aceptación verificables | CA-01: Dado un usuario con rol Empleado, cuando inicia sesión, entonces ve el panel de carga y consulta de documentos, sin las opciones administrativas. |
| | 4. RELACIONES | |
| | Dependencias | RF-005 |
| | Requisitos hijos | Ninguno |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (7 de 53) RF-007 — Cierre de sesión | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-007 |
| | Título | Cierre de sesión |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Permite a cualquier usuario autenticado cerrar su sesión de forma segura. |
| | Fuente o parte interesada | Área de TI - Seguridad de la información |
| | Justificación | Complementa la gestión segura de sesiones exigida en RNF-07. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El usuario tiene una sesión activa. |
| | Disparador | El usuario selecciona la opción Cerrar sesión. |
| | Flujo principal | 1. El usuario selecciona cerrar sesión. 2. El sistema invalida el token de sesión activo. 3. El sistema redirige a la pantalla de selección de rol (RF-001). |
| | Reglas de negocio y validaciones | RN-01: Una sesión cerrada no puede reutilizarse para acceder a funcionalidades protegidas. |
| | Criterios de aceptación verificables | CA-01: Dado que el usuario cierra sesión, cuando intenta acceder de nuevo a una funcionalidad protegida sin autenticarse, entonces el sistema lo redirige al inicio de sesión. |
| | 4. RELACIONES | |
| | Dependencias | Ninguna |
| | Requisitos hijos | Ninguno |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (8 de 53) RF-008 — Carga de documentos | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-008 |
| | Título | Carga de documentos |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Permite al usuario con rol Empleado cargar documentos contractuales en PDF para su registro y posterior verificación de integridad. |
| | Fuente o parte interesada | Área de Gestión Humana / Empleado firmante |
| | Justificación | Es la funcionalidad central del MVP: da inicio al proceso de generación de evidencia de integridad documental descrito en el alcance del proyecto. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El usuario está autenticado con rol Empleado. |
| | Disparador | El empleado selecciona Cargar documento. |
| | Flujo principal | 1. El sistema muestra el formulario de carga. 2. El empleado selecciona el archivo PDF. 3. El sistema ejecuta las validaciones de RF-009 a RF-012 antes de continuar con RF-013. |
| | Reglas de negocio y validaciones | RN-01: Solo un usuario con rol Empleado puede iniciar la carga. |
| | Criterios de aceptación verificables | CA-01: Dado un archivo PDF válido, cuando el empleado lo carga, entonces el sistema inicia el proceso de registro. |
| | 4. RELACIONES | |
| | Dependencias | RF-005 |
| | Requisitos hijos | RF-009, RF-010, RF-011, RF-012 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (9 de 53) RF-009 — Restricción de formato | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-009 |
| | Título | Restricción de formato |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | El sistema acepta exclusivamente archivos con formato PDF. |
| | Fuente o parte interesada | Alcance técnico del proyecto (documentos contractuales en PDF) |
| | Justificación | El alcance del MVP delimita la gestión documental exclusivamente a contratos laborales y acuerdos de confidencialidad en formato PDF. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El empleado seleccionó un archivo para cargar. |
| | Disparador | El sistema recibe el archivo seleccionado. |
| | Flujo principal | 1. El sistema verifica la extensión y el tipo MIME del archivo. 2. Si es PDF, continúa el proceso; si no, rechaza la carga. |
| | Reglas de negocio y validaciones | RN-01: Formatos distintos a PDF (DOCX, XML, imágenes) son rechazados, conforme a las limitaciones del proyecto. |
| | Criterios de aceptación verificables | CA-01: Dado un archivo con extensión .docx, cuando se intenta cargar, entonces el sistema lo rechaza e informa el motivo. |
| | 4. RELACIONES | |
| | Dependencias | RF-008 |
| | Requisitos hijos | Ninguno |
| | Comentarios | Alineado con RNF-23 y con la limitación funcional del proyecto (solo PDF). |
| | | |
| | | |
| Ficha de requisito funcional (10 de 53) RF-010 — Restricción de carga individual | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-010 |
| | Título | Restricción de carga individual |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Permite la carga de un único documento por operación; no admite cargas masivas o por lotes. |
| | Fuente o parte interesada | Alcance técnico del proyecto |
| | Justificación | El MVP no contempla procesamiento masivo, conforme a las limitaciones definidas (sin pruebas de carga a escala empresarial). |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El empleado accede al formulario de carga. |
| | Disparador | El empleado intenta seleccionar archivos. |
| | Flujo principal | 1. El formulario permite seleccionar un solo archivo. 2. Si el usuario intenta seleccionar más de uno, el sistema conserva solo el primero o muestra un aviso. |
| | Reglas de negocio y validaciones | RN-01: No se permite selección múltiple de archivos en el control de carga. |
| | Criterios de aceptación verificables | CA-01: Dado que el empleado intenta seleccionar varios archivos a la vez, cuando confirma la selección, entonces el sistema le solicita elegir un único archivo. |
| | 4. RELACIONES | |
| | Dependencias | RF-008 |
| | Requisitos hijos | Ninguno |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (11 de 53) RF-011 — Restricción de tamaño | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-011 |
| | Título | Restricción de tamaño |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Acepta únicamente archivos PDF con tamaño igual o inferior a 20 MB. |
| | Fuente o parte interesada | Decisión técnica del equipo de desarrollo (arquitectura y capacidad de procesamiento) |
| | Justificación | Limita el consumo de recursos de hashing y de almacenamiento de metadatos, preservando el rendimiento definido en RNF-09 y RNF-10. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El archivo fue seleccionado y es formato PDF (RF-009). |
| | Disparador | El sistema recibe el archivo para su validación. |
| | Flujo principal | 1. El sistema mide el tamaño del archivo. 2. Si es ≤20 MB, continúa el proceso; si no, lo rechaza. |
| | Reglas de negocio y validaciones | RN-01: Archivos mayores a 20 MB no se procesan. |
| | Criterios de aceptación verificables | CA-01: Dado un archivo PDF de 25 MB, cuando se intenta cargar, entonces el sistema lo rechaza e informa el límite permitido. |
| | 4. RELACIONES | |
| | Dependencias | RF-009 |
| | Requisitos hijos | Ninguno |
| | Comentarios | Corresponde al umbral definido en RNF-24; es una decisión de diseño del proyecto, no proviene de una norma externa. |
| | | |
| | | |
| Ficha de requisito funcional (12 de 53) RF-012 — Validación previa de documentos | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-012 |
| | Título | Validación previa de documentos |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Valida el formato y tamaño del archivo antes de iniciar su registro. |
| | Fuente o parte interesada | Equipo de desarrollo |
| | Justificación | Evita procesar documentos que no cumplen las restricciones del sistema antes de invertir recursos en el registro (RF-013 a RF-016). |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El archivo fue seleccionado. |
| | Disparador | El empleado confirma la carga del archivo. |
| | Flujo principal | 1. El sistema ejecuta en conjunto las validaciones de formato (RF-009) y tamaño (RF-011). 2. Si ambas se cumplen, continúa con RF-013; si alguna falla, detiene el proceso y notifica el error. |
| | Reglas de negocio y validaciones | RN-01: El registro (RF-013) no inicia si alguna validación previa falla. |
| | Criterios de aceptación verificables | CA-01: Dado un archivo que no cumple formato o tamaño, cuando se valida, entonces el sistema detiene el proceso antes de generar metadatos o huella. |
| | 4. RELACIONES | |
| | Dependencias | RF-009, RF-011 |
| | Requisitos hijos | RF-013 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (13 de 53) RF-013 — Registro del documento | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-013 |
| | Título | Registro del documento |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Registra los metadatos asociados al documento cargado (identificador, nombre, usuario responsable y fecha de registro, como mínimo). |
| | Fuente o parte interesada | Empleado / Área de Gestión Humana |
| | Justificación | Provee la información operativa necesaria para la consulta (RF-018, RF-019) y la trazabilidad (RF-021, RF-022) del documento. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El archivo pasó las validaciones previas (RF-012). |
| | Disparador | El sistema confirma que el archivo es válido. |
| | Flujo principal | 1. El sistema genera un identificador único para el documento. 2. El sistema almacena en la base de datos no relacional el nombre, identificador, usuario responsable y fecha de registro. 3. El sistema continúa con RF-014. |
| | Reglas de negocio y validaciones | RN-01: El contenido del documento no se almacena en la blockchain (ver RNF-04); solo se conservan metadatos y huella criptográfica. |
| | Criterios de aceptación verificables | CA-01: Dado un documento válido, cuando se registra, entonces el sistema le asigna un identificador único y guarda sus metadatos. |
| | 4. RELACIONES | |
| | Dependencias | RF-012 |
| | Requisitos hijos | RF-014 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (14 de 53) RF-014 — Generación de huella criptográfica | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-014 |
| | Título | Generación de huella criptográfica |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Genera automáticamente una huella criptográfica mediante SHA-256 a partir del contenido del documento cargado. |
| | Fuente o parte interesada | Alcance técnico del proyecto |
| | Justificación | El uso de SHA-256 está definido en el alcance técnico del proyecto y es el mecanismo central de verificación de integridad documental [34]. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El documento fue registrado (RF-013). |
| | Disparador | El sistema concluye el registro de metadatos. |
| | Flujo principal | 1. El sistema procesa el contenido binario del documento con el algoritmo SHA-256. 2. El sistema obtiene la huella digital de 256 bits. |
| | Reglas de negocio y validaciones | RN-01: La huella se genera sobre el contenido completo del documento, de forma automática, sin intervención manual (RNF-11). |
| | Criterios de aceptación verificables | CA-01: Dado un documento registrado, cuando se genera su huella, entonces dos ejecuciones sobre el mismo contenido producen exactamente el mismo hash. |
| | 4. RELACIONES | |
| | Dependencias | RF-013 |
| | Requisitos hijos | RF-015 |
| | Comentarios | SHA-256 pertenece a la familia SHA-2 estandarizada por el NIST [34]; se eligió por ser el algoritmo utilizado internamente por Hyperledger Fabric [19]. |
| | | |
| | | |
| Ficha de requisito funcional (15 de 53) RF-015 — Registro de la huella criptográfica | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-015 |
| | Título | Registro de la huella criptográfica |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Registra la huella criptográfica generada como evidencia de integridad del documento. |
| | Fuente o parte interesada | Alcance técnico del proyecto |
| | Justificación | Provee la evidencia técnica verificable exigida por la Ley 527 de 1999 para sostener la integridad de un mensaje de datos [10]. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | La huella fue generada (RF-014). |
| | Disparador | El sistema obtiene el hash SHA-256 del documento. |
| | Flujo principal | 1. El sistema asocia la huella al identificador del documento. 2. El sistema envía la huella al módulo de registro en blockchain (RF-016). |
| | Reglas de negocio y validaciones | RN-01: La huella registrada es la única evidencia de integridad reconocida por el sistema para comparaciones posteriores. |
| | Criterios de aceptación verificables | CA-01: Dado que la huella fue generada, cuando se registra, entonces queda asociada de forma unívoca al identificador del documento. |
| | 4. RELACIONES | |
| | Dependencias | RF-014 |
| | Requisitos hijos | RF-016 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (16 de 53) RF-016 — Registro en blockchain | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-016 |
| | Título | Registro en blockchain |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Registra en la red blockchain permisionada (Hyperledger Fabric) la huella criptográfica y los eventos asociados al documento, sin almacenar el archivo PDF directamente en la blockchain. |
| | Fuente o parte interesada | Alcance técnico del proyecto |
| | Justificación | Corresponde al modelo de persistencia híbrida definido en el proyecto: la blockchain conserva evidencia inmutable sin exponer el contenido del documento [19], [31]. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | La huella fue registrada en el módulo documental (RF-015). |
| | Disparador | El sistema envía la huella al chaincode. |
| | Flujo principal | 1. El backend invoca al chaincode mediante el Fabric SDK. 2. El chaincode registra la huella y el evento registro en el ledger. 3. La red retorna un identificador de transacción (txID). |
| | Reglas de negocio y validaciones | RN-01: El chaincode nunca recibe ni almacena el archivo PDF, solo la huella y los metadatos del evento. RN-02: Toda transacción generada obtiene un txID único. |
| | Criterios de aceptación verificables | CA-01: Dado que la huella fue enviada al chaincode, cuando se registra en el ledger, entonces el sistema recibe un txID válido. |
| | 4. RELACIONES | |
| | Dependencias | RF-015 |
| | Requisitos hijos | RF-017 |
| | Comentarios | Corresponde a RNF-04, RNF-05 y RNF-20. |
| | | |
| | | |
| Ficha de requisito funcional (17 de 53) RF-017 — Confirmación de registro | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-017 |
| | Título | Confirmación de registro |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Informa al empleado cuando el documento fue registrado correctamente y su huella criptográfica fue generada. |
| | Fuente o parte interesada | Empleado |
| | Justificación | Brinda retroalimentación clara al usuario sobre el resultado de la operación, conforme a RNF-17. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debería (Should) |
| | Importancia | Media |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El registro en blockchain fue exitoso (RF-016). |
| | Disparador | El sistema recibe el txID de confirmación del ledger. |
| | Flujo principal | 1. El sistema recibe la confirmación del chaincode. 2. El sistema muestra al empleado un mensaje de éxito con el identificador del documento. |
| | Reglas de negocio y validaciones | RN-01: Si el registro en blockchain falla, el sistema no debe mostrar un mensaje de éxito. |
| | Criterios de aceptación verificables | CA-01: Dado un registro exitoso, cuando concluye, entonces el empleado ve un mensaje de confirmación con el identificador del documento. |
| | 4. RELACIONES | |
| | Dependencias | RF-016 |
| | Requisitos hijos | Ninguno |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (18 de 53) RF-018 — Consulta de documentos | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-018 |
| | Título | Consulta de documentos |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Permite al empleado consultar los documentos que ha registrado en la plataforma. |
| | Fuente o parte interesada | Empleado |
| | Justificación | Da visibilidad al empleado sobre el estado de sus propios documentos, sin necesidad de mecanismos externos de seguimiento. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El empleado está autenticado y tiene al menos un documento registrado. |
| | Disparador | El empleado selecciona Mis documentos. |
| | Flujo principal | 1. El sistema consulta los documentos cuyo usuario responsable es el empleado autenticado. 2. El sistema muestra el listado (RF-019). |
| | Reglas de negocio y validaciones | RN-01: El empleado solo visualiza documentos que él mismo registró. |
| | Criterios de aceptación verificables | CA-01: Dado un empleado con documentos registrados, cuando consulta su listado, entonces solo ve los documentos que él cargó. |
| | 4. RELACIONES | |
| | Dependencias | RF-013 |
| | Requisitos hijos | RF-019, RF-020 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (19 de 53) RF-019 — Información del documento | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-019 |
| | Título | Información del documento |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Muestra, como mínimo, el nombre del documento, identificador, fecha de registro y estado actual. |
| | Fuente o parte interesada | Empleado |
| | Justificación | Provee la información mínima necesaria para identificar y dar seguimiento a cada documento. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El empleado consultó su listado de documentos (RF-018). |
| | Disparador | El sistema muestra el listado de documentos. |
| | Flujo principal | 1. El sistema recupera los metadatos de cada documento. 2. El sistema los presenta en una tabla con nombre, identificador, fecha de registro y estado. |
| | Reglas de negocio y validaciones | RN-01: Los campos mínimos mostrados son nombre, identificador, fecha de registro y estado. |
| | Criterios de aceptación verificables | CA-01: Dado un documento registrado, cuando se lista, entonces se muestran los cuatro campos mínimos definidos. |
| | 4. RELACIONES | |
| | Dependencias | RF-018 |
| | Requisitos hijos | Ninguno |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (20 de 53) RF-020 — Estado del documento | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-020 |
| | Título | Estado del documento |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Muestra para cada documento uno de los siguientes estados: Pendiente, Verificado o Alterado. |
| | Fuente o parte interesada | Empleado / Verificador |
| | Justificación | Da trazabilidad visual inmediata sobre el resultado de la verificación de integridad, sin requerir consultar directamente la blockchain. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El documento fue registrado (RF-013). |
| | Disparador | El sistema muestra la información del documento (RF-019). |
| | Flujo principal | 1. El sistema consulta el último resultado de verificación asociado al documento. 2. Si no existe verificación previa, el estado es Pendiente; si la última comparación coincidió, Verificado; si no coincidió, Alterado. |
| | Reglas de negocio y validaciones | RN-01: El estado solo puede tomar uno de los tres valores definidos. RN-02: El estado se actualiza automáticamente según RF-034. |
| | Criterios de aceptación verificables | CA-01: Dado un documento sin verificaciones previas, cuando se consulta, entonces su estado es Pendiente. |
| | 4. RELACIONES | |
| | Dependencias | RF-013, RF-034 |
| | Requisitos hijos | Ninguno |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (21 de 53) RF-021 — Consulta de trazabilidad | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-021 |
| | Título | Consulta de trazabilidad |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Permite al empleado consultar el historial de acciones asociadas a sus documentos. |
| | Fuente o parte interesada | Empleado |
| | Justificación | Da al empleado visibilidad sobre lo ocurrido con sus documentos, reforzando la confianza en el sistema (RNF-06, RNF-26). |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El empleado tiene al menos un documento registrado. |
| | Disparador | El empleado selecciona Ver trazabilidad sobre un documento. |
| | Flujo principal | 1. El sistema consulta en el ledger de Hyperledger Fabric los eventos asociados al documento. 2. El sistema presenta el historial (RF-022). |
| | Reglas de negocio y validaciones | RN-01: El empleado solo puede consultar la trazabilidad de los documentos que él registró. |
| | Criterios de aceptación verificables | CA-01: Dado un documento con eventos registrados, cuando el empleado consulta su trazabilidad, entonces ve el historial completo de acciones sobre ese documento. |
| | 4. RELACIONES | |
| | Dependencias | RF-018 |
| | Requisitos hijos | RF-022 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (22 de 53) RF-022 — Información de trazabilidad | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-022 |
| | Título | Información de trazabilidad |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Muestra en la trazabilidad el documento asociado, la acción realizada, el usuario responsable, el identificador de transacción (txID) generado en Hyperledger Fabric, y la fecha y hora del evento. |
| | Fuente o parte interesada | Empleado |
| | Justificación | El campo txID se agrega para alinear el requerimiento con RNF-27, que exige conservar el identificador de transacción como evidencia de auditoría. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Propuesto |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El empleado consultó la trazabilidad de un documento (RF-021). |
| | Disparador | El sistema recupera los eventos del ledger. |
| | Flujo principal | 1. El sistema recupera cada evento con sus atributos (documento, acción, usuario, txID, fecha y hora). 2. El sistema los presenta en orden cronológico. |
| | Reglas de negocio y validaciones | RN-01: El orden de los eventos siempre es cronológico y no puede alterarse desde la interfaz. |
| | Criterios de aceptación verificables | CA-01: Dado un documento con tres eventos registrados, cuando se consulta su trazabilidad, entonces se listan los tres eventos en orden cronológico con los cinco campos definidos. |
| | 4. RELACIONES | |
| | Dependencias | RF-021 |
| | Requisitos hijos | Ninguno |
| | Comentarios | Nota de cambio (v2): se agrega el campo txID respecto a la v1, para dar cobertura a RNF-27. |
| | | |
| | | |
| Ficha de requisito funcional (23 de 53) RF-023 — Acceso al módulo de verificación | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-023 |
| | Título | Acceso al módulo de verificación |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Permite al usuario con rol Verificador acceder al módulo de verificación de integridad documental. |
| | Fuente o parte interesada | Área Jurídica y de Cumplimiento (rol Verificador) |
| | Justificación | Habilita la funcionalidad central del rol Verificador, definida en el alcance funcional del proyecto. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El usuario está autenticado con rol Verificador. |
| | Disparador | El verificador selecciona Verificar documento en su panel. |
| | Flujo principal | 1. El sistema valida que el usuario tenga rol Verificador. 2. El sistema muestra el módulo de verificación. |
| | Reglas de negocio y validaciones | RN-01: Solo el rol Verificador y el rol Administrador pueden acceder a este módulo (ver RF-027). |
| | Criterios de aceptación verificables | CA-01: Dado un usuario con rol Verificador autenticado, cuando accede al módulo, entonces el sistema le muestra la opción de seleccionar un documento a verificar. |
| | 4. RELACIONES | |
| | Dependencias | RF-005 |
| | Requisitos hijos | RF-024 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (24 de 53) RF-024 — Selección del documento registrado | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-024 |
| | Título | Selección del documento registrado |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Permite al verificador seleccionar un documento previamente registrado en el sistema para realizar su verificación. |
| | Fuente o parte interesada | Verificador |
| | Justificación | Es el primer paso del flujo de verificación de integridad documental. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El verificador accedió al módulo de verificación (RF-023). |
| | Disparador | El verificador busca o selecciona un documento de la lista. |
| | Flujo principal | 1. El sistema muestra los documentos registrados disponibles. 2. El verificador selecciona el documento a validar o ingresa su identificador. |
| | Reglas de negocio y validaciones | RN-01: Solo pueden seleccionarse documentos previamente registrados en el sistema. |
| | Criterios de aceptación verificables | CA-01: Dado un documento registrado, cuando el verificador lo selecciona, entonces el sistema continúa con la validación de existencia (RF-025). |
| | 4. RELACIONES | |
| | Dependencias | RF-023 |
| | Requisitos hijos | RF-025 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (25 de 53) RF-025 — Validación de existencia | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-025 |
| | Título | Validación de existencia |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Consulta mediante el identificador del documento si este se encuentra previamente registrado en el sistema. |
| | Fuente o parte interesada | Verificador |
| | Justificación | Evita iniciar un proceso de verificación sobre un documento inexistente. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El verificador seleccionó o ingresó un identificador de documento (RF-024). |
| | Disparador | El sistema recibe el identificador del documento. |
| | Flujo principal | 1. El sistema busca el identificador en la base de datos de metadatos. 2. Si existe, continúa con RF-026; si no, muestra un mensaje de error. |
| | Reglas de negocio y validaciones | RN-01: Un identificador inexistente no puede continuar el flujo de verificación. |
| | Criterios de aceptación verificables | CA-01: Dado un identificador que no existe, cuando se consulta, entonces el sistema informa que el documento no está registrado. |
| | 4. RELACIONES | |
| | Dependencias | RF-024 |
| | Requisitos hijos | RF-026 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (26 de 53) RF-026 — Consulta de huella registrada | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-026 |
| | Título | Consulta de huella registrada |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Muestra al verificador la huella criptográfica registrada para el documento seleccionado. |
| | Fuente o parte interesada | Verificador |
| | Justificación | Es la evidencia base contra la cual se comparará la huella del documento a verificar. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El documento existe en el sistema (RF-025). |
| | Disparador | El sistema confirma la existencia del documento. |
| | Flujo principal | 1. El sistema recupera la huella registrada desde el ledger o desde el registro de metadatos. 2. El sistema la muestra al verificador conforme a RF-027. |
| | Reglas de negocio y validaciones | RN-01: La huella mostrada corresponde a la registrada en el momento del registro inicial (RF-015), no a una recalculada. |
| | Criterios de aceptación verificables | CA-01: Dado un documento existente, cuando se consulta su huella, entonces el sistema muestra el hash SHA-256 registrado. |
| | 4. RELACIONES | |
| | Dependencias | RF-025 |
| | Requisitos hijos | RF-027 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (27 de 53) RF-027 — Restricción de visualización del hash | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-027 |
| | Título | Restricción de visualización del hash |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | La huella criptográfica completa es visible únicamente para los usuarios autorizados, de acuerdo con las reglas de acceso definidas para el rol Verificador y Administrador. |
| | Fuente o parte interesada | Área de TI - Seguridad de la información |
| | Justificación | Limita la exposición de información sensible conforme a RNF-08, evitando que roles no autorizados (Empleado) vean la huella completa fuera de su propio documento. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | La huella fue recuperada (RF-026). |
| | Disparador | El sistema muestra el resultado de la consulta de huella. |
| | Flujo principal | 1. El sistema valida el rol del usuario autenticado. 2. Si es Verificador o Administrador, muestra la huella completa; en otro caso, la oculta o restringe. |
| | Reglas de negocio y validaciones | RN-01: Solo los roles Verificador y Administrador visualizan la huella completa de cualquier documento. |
| | Criterios de aceptación verificables | CA-01: Dado un usuario con rol Empleado, cuando intenta ver la huella completa de un documento ajeno, entonces el sistema le deniega el acceso. |
| | 4. RELACIONES | |
| | Dependencias | RF-026 |
| | Requisitos hijos | Ninguno |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (28 de 53) RF-028 — Carga del documento a verificar | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-028 |
| | Título | Carga del documento a verificar |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Permite al verificador cargar el documento PDF que será comparado con la versión previamente registrada. |
| | Fuente o parte interesada | Verificador |
| | Justificación | Es el insumo necesario para generar la huella de comparación (RF-030). |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | La huella registrada fue consultada (RF-026). |
| | Disparador | El verificador selecciona Cargar documento a comparar. |
| | Flujo principal | 1. El sistema muestra el formulario de carga. 2. El verificador selecciona el archivo PDF. 3. El sistema ejecuta las validaciones de RF-029. |
| | Reglas de negocio y validaciones | RN-01: Solo se admite un archivo por operación de verificación (equivalente a RF-010). |
| | Criterios de aceptación verificables | CA-01: Dado un archivo PDF cargado, cuando se envía, entonces el sistema inicia su validación. |
| | 4. RELACIONES | |
| | Dependencias | RF-026 |
| | Requisitos hijos | RF-029 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (29 de 53) RF-029 — Validación del documento de comparación | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-029 |
| | Título | Validación del documento de comparación |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Verifica que el documento utilizado para la comparación cumpla con las restricciones de formato PDF y tamaño máximo de 20 MB. |
| | Fuente o parte interesada | Verificador |
| | Justificación | Aplica las mismas restricciones de RF-009 y RF-011 al documento de comparación, garantizando consistencia en el procesamiento. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El verificador cargó un archivo (RF-028). |
| | Disparador | El sistema recibe el archivo cargado. |
| | Flujo principal | 1. El sistema valida formato PDF. 2. El sistema valida tamaño ≤20 MB. 3. Si ambas validaciones pasan, continúa con RF-030. |
| | Reglas de negocio y validaciones | RN-01: Un archivo que no cumpla formato o tamaño detiene el proceso de verificación. |
| | Criterios de aceptación verificables | CA-01: Dado un archivo de 30 MB, cuando se valida, entonces el sistema lo rechaza e informa el límite permitido. |
| | 4. RELACIONES | |
| | Dependencias | RF-028 |
| | Requisitos hijos | RF-030 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (30 de 53) RF-030 — Generación de hash del documento de comparación | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-030 |
| | Título | Generación de hash del documento de comparación |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Genera mediante SHA-256 la huella criptográfica del documento cargado para la verificación. |
| | Fuente o parte interesada | Verificador |
| | Justificación | Es el dato que se comparará contra la huella registrada (RF-031), aplicando el mismo algoritmo usado en el registro (RF-014). |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El documento de comparación fue validado (RF-029). |
| | Disparador | El sistema confirma que el archivo es válido. |
| | Flujo principal | 1. El sistema procesa el contenido del archivo con SHA-256. 2. El sistema obtiene la huella del documento cargado. |
| | Reglas de negocio y validaciones | RN-01: La huella se calcula con el mismo algoritmo y parámetros utilizados en el registro original (RF-014). |
| | Criterios de aceptación verificables | CA-01: Dado un documento de comparación válido, cuando se procesa, entonces el sistema obtiene su huella SHA-256. |
| | 4. RELACIONES | |
| | Dependencias | RF-029 |
| | Requisitos hijos | RF-031 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (31 de 53) RF-031 — Comparación de huellas | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-031 |
| | Título | Comparación de huellas |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Permite al verificador ejecutar la comparación entre la huella criptográfica registrada y la huella generada a partir del documento cargado. |
| | Fuente o parte interesada | Verificador |
| | Justificación | Es la operación central de verificación de integridad documental del sistema. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | Se cuenta con la huella registrada (RF-026) y la huella del documento cargado (RF-030). |
| | Disparador | El verificador selecciona Comparar. |
| | Flujo principal | 1. El sistema toma ambas huellas. 2. El sistema ejecuta la comparación byte a byte de los valores hash. 3. El sistema continúa con RF-032. |
| | Reglas de negocio y validaciones | RN-01: La comparación es exclusivamente entre los valores hash, nunca entre los contenidos de los archivos. |
| | Criterios de aceptación verificables | CA-01: Dado dos huellas idénticas, cuando se comparan, entonces el resultado es coinciden. CA-02: Dado dos huellas distintas, cuando se comparan, entonces el resultado es no coinciden. |
| | 4. RELACIONES | |
| | Dependencias | RF-026, RF-030 |
| | Requisitos hijos | RF-032 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (32 de 53) RF-032 — Resultado de la verificación | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-032 |
| | Título | Resultado de la verificación |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Determina automáticamente el resultado de la comparación y muestra si la integridad del documento es confirmada o comprometida. |
| | Fuente o parte interesada | Verificador |
| | Justificación | Traduce el resultado técnico de la comparación (RF-031) en un mensaje comprensible para el usuario, conforme a RNF-15. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | La comparación fue ejecutada (RF-031). |
| | Disparador | El sistema concluye la comparación de huellas. |
| | Flujo principal | 1. El sistema evalúa el resultado de la comparación. 2. Si las huellas coinciden, muestra Integridad confirmada; si no coinciden, muestra Integridad comprometida. |
| | Reglas de negocio y validaciones | RN-01: El resultado solo puede ser confirmada o comprometida, sin estados intermedios. |
| | Criterios de aceptación verificables | CA-01: Dado un resultado de comparación positivo, cuando se muestra, entonces el mensaje indica integridad confirmada. |
| | 4. RELACIONES | |
| | Dependencias | RF-031 |
| | Requisitos hijos | RF-033, RF-034 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (33 de 53) RF-033 — Visualización de evidencia | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-033 |
| | Título | Visualización de evidencia |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Muestra al verificador la huella criptográfica original y la huella criptográfica obtenida del documento actual como evidencia del resultado de la comparación. |
| | Fuente o parte interesada | Verificador |
| | Justificación | Refuerza el valor probatorio del resultado al exhibir ambas evidencias, en línea con RNF-17. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debería (Should) |
| | Importancia | Media |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El resultado de la verificación fue determinado (RF-032). |
| | Disparador | El sistema muestra el resultado de la verificación. |
| | Flujo principal | 1. El sistema presenta lado a lado la huella original y la huella obtenida. 2. El verificador puede revisar ambos valores. |
| | Reglas de negocio y validaciones | RN-01: Ambas huellas se muestran completas cuando el usuario tiene el rol autorizado (RF-027). |
| | Criterios de aceptación verificables | CA-01: Dado un resultado de verificación, cuando se visualiza, entonces se muestran ambas huellas comparadas. |
| | 4. RELACIONES | |
| | Dependencias | RF-032 |
| | Requisitos hijos | Ninguno |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (34 de 53) RF-034 — Actualización del estado | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-034 |
| | Título | Actualización del estado |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Actualiza automáticamente el estado del documento a Verificado cuando las huellas coincidan o a Alterado cuando las huellas sean diferentes. |
| | Fuente o parte interesada | Verificador / Empleado |
| | Justificación | Mantiene consistente el estado visible del documento (RF-020) con el resultado real de la última verificación. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El resultado de la verificación fue determinado (RF-032). |
| | Disparador | El sistema concluye la evaluación del resultado. |
| | Flujo principal | 1. El sistema toma el resultado de la comparación. 2. El sistema actualiza el campo estado del documento en la base de datos. |
| | Reglas de negocio y validaciones | RN-01: El estado se actualiza automáticamente; no puede modificarse manualmente por ningún rol. |
| | Criterios de aceptación verificables | CA-01: Dado un resultado no coinciden, cuando se procesa, entonces el estado del documento cambia a Alterado. |
| | 4. RELACIONES | |
| | Dependencias | RF-032 |
| | Requisitos hijos | Ninguno |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (35 de 53) RF-035 — Registro de la verificación | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-035 |
| | Título | Registro de la verificación |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Registra en la trazabilidad la acción de verificación, el usuario que la realizó, la fecha y hora, el identificador de transacción (txID) generado en Hyperledger Fabric, y el resultado obtenido. |
| | Fuente o parte interesada | Verificador |
| | Justificación | El campo txID se agrega por la misma razón indicada en RF-022, para dar soporte a RNF-27. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Propuesto |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El estado del documento fue actualizado (RF-034). |
| | Disparador | El sistema concluye la actualización de estado. |
| | Flujo principal | 1. El sistema envía al chaincode el evento de verificación con su resultado. 2. El chaincode registra el evento en el ledger y retorna un txID. |
| | Reglas de negocio y validaciones | RN-01: Todo proceso de verificación genera un evento en el ledger, independientemente de su resultado. |
| | Criterios de aceptación verificables | CA-01: Dado que una verificación concluyó, cuando se registra, entonces el ledger contiene el evento con su txID y resultado. |
| | 4. RELACIONES | |
| | Dependencias | RF-034 |
| | Requisitos hijos | RF-036 |
| | Comentarios | Nota de cambio (v2): se agrega el campo txID respecto a la v1. |
| | | |
| | | |
| Ficha de requisito funcional (36 de 53) RF-036 — Nueva verificación | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-036 |
| | Título | Nueva verificación |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Proporciona una opción denominada Nueva verificación que permite iniciar un nuevo proceso de verificación. |
| | Fuente o parte interesada | Verificador |
| | Justificación | Facilita la operación repetida del módulo sin necesidad de reiniciar sesión, mejorando la usabilidad (RNF-15). |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debería (Should) |
| | Importancia | Media |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | Una verificación fue registrada (RF-035). |
| | Disparador | El verificador selecciona Nueva verificación. |
| | Flujo principal | 1. El sistema limpia el formulario de verificación. 2. El sistema retorna al paso de selección de documento (RF-024). |
| | Reglas de negocio y validaciones | RN-01: No se conservan datos de la verificación anterior en el nuevo formulario. |
| | Criterios de aceptación verificables | CA-01: Dado que el verificador selecciona Nueva verificación, cuando confirma, entonces el sistema muestra el formulario vacío de selección de documento. |
| | 4. RELACIONES | |
| | Dependencias | RF-035 |
| | Requisitos hijos | Ninguno |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (37 de 53) RF-037 — Consulta de documentos registrados | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-037 |
| | Título | Consulta de documentos registrados |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Permite al verificador consultar los documentos registrados en el sistema. |
| | Fuente o parte interesada | Verificador |
| | Justificación | Da al verificador visibilidad general para ubicar documentos a validar y dar seguimiento a su estado. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El verificador está autenticado. |
| | Disparador | El verificador selecciona Documentos registrados. |
| | Flujo principal | 1. El sistema consulta el conjunto de documentos registrados. 2. El sistema los presenta según RF-038. |
| | Reglas de negocio y validaciones | RN-01: El verificador puede consultar documentos registrados por cualquier empleado, a diferencia del alcance restringido del rol Empleado (RF-018). |
| | Criterios de aceptación verificables | CA-01: Dado que el verificador accede al listado, cuando lo consulta, entonces ve todos los documentos registrados en el sistema. |
| | 4. RELACIONES | |
| | Dependencias | RF-023 |
| | Requisitos hijos | RF-038 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (38 de 53) RF-038 — Vista de documentos del verificador | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-038 |
| | Título | Vista de documentos del verificador |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Muestra al verificador, como mínimo, el nombre del documento, identificador, usuario responsable, fecha de registro, estado y huella criptográfica, de acuerdo con sus permisos de acceso. |
| | Fuente o parte interesada | Verificador |
| | Justificación | Provee la información necesaria para ubicar y auditar cualquier documento registrado en el sistema. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El verificador consultó el listado (RF-037). |
| | Disparador | El sistema muestra el listado de documentos. |
| | Flujo principal | 1. El sistema recupera los metadatos y la huella de cada documento. 2. El sistema los presenta en una tabla con los seis campos mínimos. |
| | Reglas de negocio y validaciones | RN-01: La huella se muestra completa solo si el usuario está autorizado (RF-027). |
| | Criterios de aceptación verificables | CA-01: Dado un documento registrado, cuando se lista para el verificador, entonces se muestran los seis campos definidos. |
| | 4. RELACIONES | |
| | Dependencias | RF-037, RF-027 |
| | Requisitos hijos | Ninguno |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (39 de 53) RF-039 — Consulta de trazabilidad general | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-039 |
| | Título | Consulta de trazabilidad general |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Permite al verificador consultar el historial completo de acciones registradas sobre los documentos. |
| | Fuente o parte interesada | Verificador |
| | Justificación | Habilita la auditoría documental completa exigida por RNF-26. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El verificador está autenticado. |
| | Disparador | El verificador selecciona Trazabilidad general. |
| | Flujo principal | 1. El sistema consulta en el ledger todos los eventos registrados. 2. El sistema los presenta según RF-040. |
| | Reglas de negocio y validaciones | RN-01: A diferencia del empleado (RF-021), el verificador puede consultar la trazabilidad de cualquier documento del sistema. |
| | Criterios de aceptación verificables | CA-01: Dado que el verificador accede a la trazabilidad general, cuando la consulta, entonces ve los eventos de todos los documentos registrados. |
| | 4. RELACIONES | |
| | Dependencias | RF-023 |
| | Requisitos hijos | RF-040 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (40 de 53) RF-040 — Información de trazabilidad general | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-040 |
| | Título | Información de trazabilidad general |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | La trazabilidad general presenta como mínimo los campos Documento, Acción, Usuario, Identificador de transacción (txID), Fecha y Resultado. |
| | Fuente o parte interesada | Verificador |
| | Justificación | Se agrega el campo txID; los demás campos se mantienen igual a la v1, conforme a RNF-27. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Propuesto |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El verificador consultó la trazabilidad general (RF-039). |
| | Disparador | El sistema recupera los eventos del ledger. |
| | Flujo principal | 1. El sistema recupera cada evento con sus seis atributos. 2. El sistema los presenta en una tabla ordenada cronológicamente. |
| | Reglas de negocio y validaciones | RN-01: El orden cronológico de los eventos no puede alterarse desde la interfaz. |
| | Criterios de aceptación verificables | CA-01: Dado el conjunto de eventos del ledger, cuando se listan, entonces se muestran los seis campos definidos para cada evento. |
| | 4. RELACIONES | |
| | Dependencias | RF-039 |
| | Requisitos hijos | Ninguno |
| | Comentarios | Nota de cambio (v2): se agrega el campo txID respecto a la v1. |
| | | |
| | | |
| Ficha de requisito funcional (41 de 53) RF-041 — Panel general | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-041 |
| | Título | Panel general |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Proporciona al Administrador un panel general con información consolidada sobre el estado de los documentos registrados. |
| | Fuente o parte interesada | Área de TI / Administración de sistemas |
| | Justificación | Da visibilidad ejecutiva sobre el uso y el estado del sistema, apoyando la supervisión operativa. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debería (Should) |
| | Importancia | Media |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El administrador está autenticado. |
| | Disparador | El administrador inicia sesión. |
| | Flujo principal | 1. El sistema consulta las métricas consolidadas de documentos. 2. El sistema las muestra en el panel principal (RF-042). |
| | Reglas de negocio y validaciones | RN-01: El panel se actualiza con datos vigentes cada vez que se consulta. |
| | Criterios de aceptación verificables | CA-01: Dado que el administrador inicia sesión, cuando accede al panel, entonces ve el resumen documental consolidado. |
| | 4. RELACIONES | |
| | Dependencias | RF-005 |
| | Requisitos hijos | RF-042 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (42 de 53) RF-042 — Resumen documental | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-042 |
| | Título | Resumen documental |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | El panel general muestra como mínimo el número total de documentos registrados, documentos verificados, documentos pendientes y documentos alterados. |
| | Fuente o parte interesada | Área de TI / Administración de sistemas |
| | Justificación | Permite dimensionar rápidamente el estado global de la gestión documental sin recorrer cada documento individualmente. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debería (Should) |
| | Importancia | Media |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El administrador accedió al panel general (RF-041). |
| | Disparador | El sistema construye el panel. |
| | Flujo principal | 1. El sistema cuenta los documentos por cada estado (RF-020). 2. El sistema muestra los cuatro totales definidos. |
| | Reglas de negocio y validaciones | RN-01: Los totales deben corresponder exactamente a la suma de documentos en cada estado. |
| | Criterios de aceptación verificables | CA-01: Dado un conjunto de documentos con distintos estados, cuando se calcula el resumen, entonces la suma de los totales por estado coincide con el total general. |
| | 4. RELACIONES | |
| | Dependencias | RF-041, RF-020 |
| | Requisitos hijos | Ninguno |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (43 de 53) RF-043 — Consulta de usuarios | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-043 |
| | Título | Consulta de usuarios |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Permite al Administrador consultar los usuarios registrados en la plataforma. |
| | Fuente o parte interesada | Área de TI / Administración de sistemas |
| | Justificación | Es la base para la gestión del ciclo de vida de usuarios exigida por el esquema RBAC de RNF-03. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El administrador está autenticado. |
| | Disparador | El administrador selecciona Usuarios. |
| | Flujo principal | 1. El sistema consulta el listado de usuarios registrados. 2. El sistema lo presenta según RF-044. |
| | Reglas de negocio y validaciones | RN-01: Solo el rol Administrador puede acceder al listado completo de usuarios. |
| | Criterios de aceptación verificables | CA-01: Dado que el administrador accede al módulo de usuarios, cuando lo consulta, entonces ve el listado completo de usuarios registrados. |
| | 4. RELACIONES | |
| | Dependencias | RF-005 |
| | Requisitos hijos | RF-044 |
| | Comentarios | Amplía el detalle funcional textual del alcance del proyecto (2.6.1), que no menciona explícitamente la gestión de usuarios; se recomienda documentarlo en el capítulo de alcance final (ver hallazgo de verificación). |
| | | |
| | | |
| Ficha de requisito funcional (44 de 53) RF-044 — Información de usuarios | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-044 |
| | Título | Información de usuarios |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Muestra para cada usuario, como mínimo, su identificador, nombre, rol, correo electrónico y estado (Activo / Inactivo). |
| | Fuente o parte interesada | Área de TI / Administración de sistemas |
| | Justificación | Provee la información mínima para gestionar el ciclo de vida de cada usuario (creación, edición, desactivación). |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El administrador consultó el listado de usuarios (RF-043). |
| | Disparador | El sistema muestra el listado de usuarios. |
| | Flujo principal | 1. El sistema recupera los atributos de cada usuario. 2. El sistema los presenta en una tabla con los cinco campos mínimos. |
| | Reglas de negocio y validaciones | RN-01: El estado de cada usuario solo puede ser Activo o Inactivo. |
| | Criterios de aceptación verificables | CA-01: Dado un usuario registrado, cuando se lista, entonces se muestran los cinco campos definidos. |
| | 4. RELACIONES | |
| | Dependencias | RF-043 |
| | Requisitos hijos | Ninguno |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (45 de 53) RF-045 — Creación de usuarios | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-045 |
| | Título | Creación de usuarios |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Permite al Administrador registrar nuevos usuarios en la plataforma. |
| | Fuente o parte interesada | Área de TI / Administración de sistemas |
| | Justificación | Es necesaria para incorporar empleados y verificadores al sistema conforme a los tres roles definidos (RF-001). |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El administrador accedió al módulo de usuarios (RF-043). |
| | Disparador | El administrador selecciona Crear usuario. |
| | Flujo principal | 1. El sistema muestra el formulario de creación (nombre, correo, rol). 2. El administrador diligencia los datos y confirma. 3. El sistema crea el usuario en estado Activo. |
| | Reglas de negocio y validaciones | RN-01: El rol asignado al usuario debe ser uno de los tres roles predefinidos del sistema (Empleado, Verificador, Administrador). RN-02: El correo electrónico no puede repetirse entre usuarios. |
| | Criterios de aceptación verificables | CA-01: Dado un correo ya registrado, cuando se intenta crear el usuario, entonces el sistema muestra un aviso de duplicidad. |
| | 4. RELACIONES | |
| | Dependencias | RF-043 |
| | Requisitos hijos | RF-046, RF-047 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (46 de 53) RF-046 — Edición de usuarios | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-046 |
| | Título | Edición de usuarios |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Permite al Administrador modificar el nombre, correo electrónico y rol de los usuarios registrados. |
| | Fuente o parte interesada | Área de TI / Administración de sistemas |
| | Justificación | Permite mantener actualizada la información de los usuarios ante cambios organizacionales (por ejemplo, cambio de rol o de correo corporativo). |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debería (Should) |
| | Importancia | Media |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El usuario a editar existe en el sistema (RF-044). |
| | Disparador | El administrador selecciona Editar sobre un usuario. |
| | Flujo principal | 1. El sistema muestra el formulario con los datos actuales. 2. El administrador modifica los campos permitidos. 3. El sistema guarda los cambios. |
| | Reglas de negocio y validaciones | RN-01: El rol modificado debe ser uno de los tres roles predefinidos del sistema (RN-01 de RF-045), para no contradecir el RBAC cerrado de RNF-03. |
| | Criterios de aceptación verificables | CA-01: Dado un usuario existente, cuando el administrador modifica su rol, entonces el cambio se refleja en el siguiente inicio de sesión de ese usuario. |
| | 4. RELACIONES | |
| | Dependencias | RF-045 |
| | Requisitos hijos | Ninguno |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (47 de 53) RF-047 — Desactivación de usuarios | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-047 |
| | Título | Desactivación de usuarios |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Permite al Administrador desactivar el acceso de un usuario registrado (baja lógica), sin eliminar físicamente su información ni afectar la trazabilidad histórica asociada a sus acciones previas. |
| | Fuente o parte interesada | Área de TI / Administración de sistemas |
| | Justificación | Requerimiento nuevo (v2). Complementa RF-045/RF-046 y da cobertura completa al ciclo de vida de usuarios exigido por el esquema RBAC de RNF-03. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Propuesto |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El usuario a desactivar existe en el sistema (RF-044). |
| | Disparador | El administrador selecciona Desactivar sobre un usuario. |
| | Flujo principal | 1. El sistema solicita confirmación. 2. El administrador confirma. 3. El sistema cambia el estado del usuario a Inactivo, conservando su historial. |
| | Reglas de negocio y validaciones | RN-01: Un usuario inactivo no puede autenticarse (RF-005). RN-02: La baja es lógica; no se elimina el registro ni los eventos de trazabilidad previos asociados al usuario. |
| | Criterios de aceptación verificables | CA-01: Dado un usuario activo con documentos previamente registrados, cuando se desactiva, entonces conserva su historial de trazabilidad y ya no puede iniciar sesión. |
| | 4. RELACIONES | |
| | Dependencias | RF-045 |
| | Requisitos hijos | Ninguno |
| | Comentarios | Nota de cambio (v2): requerimiento nuevo respecto a la v1. |
| | | |
| | | |
| Ficha de requisito funcional (48 de 53) RF-048 — Consulta administrativa de documentos | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-048 |
| | Título | Consulta administrativa de documentos |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Permite al Administrador consultar los documentos registrados en el sistema. |
| | Fuente o parte interesada | Área de TI / Administración de sistemas |
| | Justificación | Da al administrador visibilidad completa para labores de supervisión y soporte del sistema. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El administrador está autenticado. |
| | Disparador | El administrador selecciona Documentos. |
| | Flujo principal | 1. El sistema consulta el conjunto completo de documentos registrados. 2. El sistema los presenta según RF-049. |
| | Reglas de negocio y validaciones | RN-01: El administrador puede consultar cualquier documento registrado en el sistema. |
| | Criterios de aceptación verificables | CA-01: Dado que el administrador accede al listado, cuando lo consulta, entonces ve todos los documentos registrados. |
| | 4. RELACIONES | |
| | Dependencias | RF-005 |
| | Requisitos hijos | RF-049 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (49 de 53) RF-049 — Vista administrativa de documentos | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-049 |
| | Título | Vista administrativa de documentos |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Muestra al Administrador, como mínimo, el nombre del documento, identificador, usuario responsable, fecha de registro, estado y huella criptográfica, respetando las restricciones de privacidad definidas para la información. |
| | Fuente o parte interesada | Área de TI / Administración de sistemas |
| | Justificación | Equipara el nivel de información disponible para el administrador con el del verificador (RF-038), preservando las restricciones de privacidad de RNF-08. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El administrador consultó el listado (RF-048). |
| | Disparador | El sistema muestra el listado de documentos. |
| | Flujo principal | 1. El sistema recupera los metadatos y la huella de cada documento. 2. El sistema los presenta con los seis campos mínimos. |
| | Reglas de negocio y validaciones | RN-01: No se muestra el contenido del documento, solo sus metadatos y huella (RNF-04). |
| | Criterios de aceptación verificables | CA-01: Dado un documento registrado, cuando se lista para el administrador, entonces se muestran los seis campos definidos, sin exponer el contenido del archivo. |
| | 4. RELACIONES | |
| | Dependencias | RF-048 |
| | Requisitos hijos | Ninguno |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (50 de 53) RF-050 — Consulta de trazabilidad administrativa | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-050 |
| | Título | Consulta de trazabilidad administrativa |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Permite al Administrador consultar el registro histórico de las acciones realizadas sobre los documentos. |
| | Fuente o parte interesada | Área de TI / Administración de sistemas |
| | Justificación | Habilita la auditoría completa del sistema desde una perspectiva administrativa, conforme a RNF-26. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El administrador está autenticado. |
| | Disparador | El administrador selecciona Trazabilidad. |
| | Flujo principal | 1. El sistema consulta en el ledger todos los eventos registrados. 2. El sistema los presenta según RF-051. |
| | Reglas de negocio y validaciones | RN-01: El administrador puede consultar la trazabilidad de cualquier documento del sistema. |
| | Criterios de aceptación verificables | CA-01: Dado que el administrador accede a la trazabilidad, cuando la consulta, entonces ve los eventos de todos los documentos registrados. |
| | 4. RELACIONES | |
| | Dependencias | RF-005 |
| | Requisitos hijos | RF-051 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (51 de 53) RF-051 — Registro administrativo de trazabilidad | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-051 |
| | Título | Registro administrativo de trazabilidad |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Presenta la trazabilidad mediante una tabla que contiene, como mínimo, el identificador del documento, acción realizada, usuario responsable, identificador de transacción (txID) generado en Hyperledger Fabric, fecha y hora, y resultado obtenido. |
| | Fuente o parte interesada | Área de TI / Administración de sistemas |
| | Justificación | Se agregan los campos txID y Resultado; este último iguala el nivel de información que ya recibía el rol Verificador en RF-040, evitando que el panel de Administrador mostrara menos datos que un rol de menor jerarquía. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Propuesto |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El administrador consultó la trazabilidad (RF-050). |
| | Disparador | El sistema recupera los eventos del ledger. |
| | Flujo principal | 1. El sistema recupera cada evento con sus atributos. 2. El sistema los presenta en una tabla ordenada cronológicamente con los seis campos definidos. |
| | Reglas de negocio y validaciones | RN-01: El nivel de detalle mostrado al administrador debe ser igual o mayor al mostrado al verificador (RF-040). |
| | Criterios de aceptación verificables | CA-01: Dado el conjunto de eventos del ledger, cuando se listan para el administrador, entonces se muestran los seis campos definidos, incluyendo txID y Resultado. |
| | 4. RELACIONES | |
| | Dependencias | RF-050 |
| | Requisitos hijos | Ninguno |
| | Comentarios | Nota de cambio (v2): se agregan los campos txID y Resultado respecto a la v1. |
| | | |
| | | |
| Ficha de requisito funcional (52 de 53) RF-052 — Cambio de contraseña | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-052 |
| | Título | Cambio de contraseña |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Permite a los usuarios autenticados cambiar su contraseña. |
| | Fuente o parte interesada | Todos los roles (Empleado, Verificador, Administrador) |
| | Justificación | Es una práctica básica de higiene de seguridad que complementa la protección de contraseñas exigida en RNF-01. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debería (Should) |
| | Importancia | Media |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El usuario tiene una sesión activa. |
| | Disparador | El usuario selecciona Cambiar contraseña. |
| | Flujo principal | 1. El sistema muestra el formulario de cambio de contraseña. 2. El usuario lo diligencia y confirma. 3. El sistema ejecuta las validaciones de RF-053. |
| | Reglas de negocio y validaciones | RN-01: La nueva contraseña debe cumplir los requisitos mínimos de complejidad definidos por el sistema. |
| | Criterios de aceptación verificables | CA-01: Dado un usuario autenticado, cuando accede a la opción de cambio de contraseña, entonces el sistema muestra el formulario correspondiente. |
| | 4. RELACIONES | |
| | Dependencias | RF-005 |
| | Requisitos hijos | RF-053 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito funcional (53 de 53) RF-053 — Validación de cambio de contraseña | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RF-053 |
| | Título | Validación de cambio de contraseña |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Solicita la contraseña actual y la nueva contraseña antes de realizar el cambio, validando que la operación sea realizada por el usuario autenticado. |
| | Fuente o parte interesada | Todos los roles |
| | Justificación | Evita que un tercero con sesión abierta cambie la contraseña sin conocer la contraseña vigente. |
| | 2. CLASIFICACIÓN | |
| | Prioridad (MoSCoW) | Debería (Should) |
| | Importancia | Media |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DETALLADA | |
| | Precondiciones | El usuario accedió al formulario de cambio de contraseña (RF-052). |
| | Disparador | El usuario envía el formulario con contraseña actual y nueva. |
| | Flujo principal | 1. El sistema valida que la contraseña actual ingresada coincida con la almacenada. 2. Si coincide, el sistema aplica el hash a la nueva contraseña y la almacena (RNF-01). 3. El sistema confirma el cambio. |
| | Reglas de negocio y validaciones | RN-01: Si la contraseña actual ingresada no coincide, el sistema rechaza el cambio. |
| | Criterios de aceptación verificables | CA-01: Dado que la contraseña actual ingresada es incorrecta, cuando se envía el formulario, entonces el sistema rechaza el cambio e informa el error. |
| | 4. RELACIONES | |
| | Dependencias | RF-052 |
| | Requisitos hijos | Ninguno |
| | Comentarios | No existe en el SRS un requerimiento de recuperación de contraseña olvidada (sin sesión activa); se recomienda evaluar si se incluye en el MVP o se documenta como limitación (ver hallazgo de verificación). |

## Ficha_RNF
| Fichas de requisitos no funcionales (RNF-001 a RNF-030) |  |  |
| --- | --- | --- |
| Una ficha de una página por cada requisito no funcional del SRS v2, generada a partir de la hoja RNF. | | |
| | | |
| Ficha de requisito no funcional (1 de 30) RNF-001 — Protección de contraseñas mediante hashing seguro | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RNF-001 |
| | Título | Protección de contraseñas mediante hashing seguro |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Las contraseñas se almacenan utilizando un mecanismo de hashing seguro con sal, nunca en texto plano. |
| | Fuente o parte interesada | Área de TI - Seguridad de la información |
| | Justificación | Previene la exposición de credenciales ante un acceso no autorizado a la base de datos, conforme a buenas prácticas de seguridad de la información referenciadas en el Anexo A de ISO/IEC 27001:2022 [23]. |
| | 2. CLASIFICACIÓN | |
| | Característica ISO/IEC 25010:2023 | Seguridad (security) |
| | Subcaracterística ISO/IEC 25010:2023 | Confidencialidad |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DE LA MEDIDA | |
| | Métrica | Verificación binaria de que el campo de contraseña almacenado corresponde a un hash con sal (no a texto plano) |
| | Unidad de medida | Cumple / No cumple |
| | Umbral de aceptación | Cumple (100 % de las contraseñas almacenadas como hash con sal, mediante bcrypt) |
| | Condición de medición | Inspección de la base de datos de usuarios en el entorno de pruebas Docker |
| | Método de verificación | Inspección |
| | 4. RELACIONES | |
| | Requisitos funcionales afectados | RF-002, RF-045, RF-052, RF-053 |
| | Dependencias | Ninguna |
| | Comentarios | BCRYPT incorpora automáticamente sal y múltiples iteraciones, según se define en el glosario del proyecto. |
| | | |
| | | |
| Ficha de requisito no funcional (2 de 30) RNF-002 — Autenticación de doble factor | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RNF-002 |
| | Título | Autenticación de doble factor |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | El sistema implementa autenticación mediante credenciales y un segundo factor de verificación mediante token. |
| | Fuente o parte interesada | Área de TI - Seguridad de la información |
| | Justificación | Se mantiene sin cambios respecto a la v1, sujeta a la misma validación pendiente indicada en RF-003 sobre el canal exclusivo de token por correo, y se alinea con el Decreto 2364 de 2012, que reconoce la validez de mecanismos tecnológicos de autenticación como la firma electrónica [36]. |
| | 2. CLASIFICACIÓN | |
| | Característica ISO/IEC 25010:2023 | Seguridad (security) |
| | Subcaracterística ISO/IEC 25010:2023 | Autenticidad |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Propuesto |
| | 3. ESPECIFICACIÓN DE LA MEDIDA | |
| | Métrica | Verificación de que el acceso requiere credenciales válidas y un token de segundo factor vigente |
| | Unidad de medida | Cumple / No cumple |
| | Umbral de aceptación | Cumple (100 % de los inicios de sesión exigen ambos factores) |
| | Condición de medición | Prueba funcional del flujo de autenticación (RF-002 a RF-005) en el entorno Docker de pruebas |
| | Método de verificación | Prueba |
| | 4. RELACIONES | |
| | Requisitos funcionales afectados | RF-002, RF-003, RF-004, RF-005 |
| | Dependencias | Ninguna |
| | Comentarios | Pendiente de validar con el tutor si el canal exclusivo de correo corporativo es suficiente o si se debe evaluar un canal alterno. |
| | | |
| | | |
| Ficha de requisito no funcional (3 de 30) RNF-003 — Control de acceso basado en roles (RBAC) | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RNF-003 |
| | Título | Control de acceso basado en roles (RBAC) |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | El sistema aplica un esquema de control de acceso basado en roles, garantizando que cada usuario únicamente pueda acceder a las funcionalidades y datos autorizados para su rol. |
| | Fuente o parte interesada | Área de TI - Seguridad de la información |
| | Justificación | Es un control fundamental de acceso lógico alineado con el Anexo A de ISO/IEC 27001:2022, tomado como referencia de diseño en el proyecto [23]. |
| | 2. CLASIFICACIÓN | |
| | Característica ISO/IEC 25010:2023 | Seguridad (security) |
| | Subcaracterística ISO/IEC 25010:2023 | Confidencialidad |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DE LA MEDIDA | |
| | Métrica | Porcentaje de intentos de acceso a funcionalidades no autorizadas para el rol que son bloqueados |
| | Unidad de medida | Porcentaje (%) |
| | Umbral de aceptación | 100 % de los intentos no autorizados bloqueados |
| | Condición de medición | Suite de pruebas funcionales de caja negra ejecutando los tres roles sobre los cinco módulos del sistema |
| | Método de verificación | Prueba |
| | 4. RELACIONES | |
| | Requisitos funcionales afectados | RF-001, RF-005, RF-006, RF-023, RF-027, RF-041 a RF-051 |
| | Dependencias | RNF-002 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito no funcional (4 de 30) RNF-004 — No almacenamiento del contenido documental en blockchain | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RNF-004 |
| | Título | No almacenamiento del contenido documental en blockchain |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | El sistema no almacena el contenido de los contratos laborales ni acuerdos de confidencialidad directamente en la red blockchain. La blockchain almacena únicamente las huellas criptográficas y los eventos necesarios para la trazabilidad. |
| | Fuente o parte interesada | Alcance técnico del proyecto |
| | Justificación | Corresponde directamente al modelo de persistencia definido en el proyecto y responde a las exigencias de minimización de datos de la Ley 1581 de 2012 [9]. |
| | 2. CLASIFICACIÓN | |
| | Característica ISO/IEC 25010:2023 | Seguridad (security) |
| | Subcaracterística ISO/IEC 25010:2023 | Confidencialidad |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DE LA MEDIDA | |
| | Métrica | Verificación de que ningún registro del ledger contiene el contenido binario o textual del documento |
| | Unidad de medida | Cumple / No cumple |
| | Umbral de aceptación | Cumple (0 documentos con contenido almacenado en el ledger) |
| | Condición de medición | Inspección del ledger de Hyperledger Fabric tras el registro de los 20 documentos sintéticos de prueba |
| | Método de verificación | Inspección |
| | 4. RELACIONES | |
| | Requisitos funcionales afectados | RF-013, RF-016 |
| | Dependencias | Ninguna |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito no funcional (5 de 30) RNF-005 — Inmutabilidad de las huellas registradas | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RNF-005 |
| | Título | Inmutabilidad de las huellas registradas |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Las huellas criptográficas registradas en la blockchain se conservan de manera inmutable, de forma que no puedan ser modificadas mediante las operaciones normales del sistema. |
| | Fuente o parte interesada | Alcance técnico del proyecto |
| | Justificación | Es la propiedad central de la infraestructura blockchain permisionada, base de la validez probatoria exigida por la Ley 527 de 1999 [10]. La reciente jurisprudencia de la Corte Suprema de Justicia (Sentencia SP248-2025) confirma que la ausencia de un hash no invalida la evidencia digital, pero sí afecta su fuerza probatoria, lo que refuerza la importancia de este control [7]. |
| | 2. CLASIFICACIÓN | |
| | Característica ISO/IEC 25010:2023 | Seguridad (security) |
| | Subcaracterística ISO/IEC 25010:2023 | Integridad |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DE LA MEDIDA | |
| | Métrica | Porcentaje de intentos de modificación de una huella ya registrada que son rechazados por el sistema |
| | Unidad de medida | Porcentaje (%) |
| | Umbral de aceptación | 100 % de los intentos de modificación rechazados |
| | Condición de medición | Pruebas de mutación documental sobre los 20 documentos sintéticos, intentando alterar registros ya confirmados en el ledger |
| | Método de verificación | Prueba |
| | 4. RELACIONES | |
| | Requisitos funcionales afectados | RF-016, RF-026 |
| | Dependencias | Ninguna |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito no funcional (6 de 30) RNF-006 — Registro de operaciones relevantes | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RNF-006 |
| | Título | Registro de operaciones relevantes |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | El sistema registra las operaciones relevantes realizadas sobre los documentos, incluyendo usuario, acción, fecha, hora y resultado cuando corresponda. |
| | Fuente o parte interesada | Alcance técnico del proyecto |
| | Justificación | Sustenta la trazabilidad documental exigida por el alcance del proyecto y por RNF-26. |
| | 2. CLASIFICACIÓN | |
| | Característica ISO/IEC 25010:2023 | Seguridad (security) |
| | Subcaracterística ISO/IEC 25010:2023 | Rendición de cuentas |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DE LA MEDIDA | |
| | Métrica | Porcentaje de operaciones sobre documentos (registro, verificación) que generan un evento de trazabilidad |
| | Unidad de medida | Porcentaje (%) |
| | Umbral de aceptación | 100 % de las operaciones generan evento de trazabilidad |
| | Condición de medición | Prueba de trazabilidad e inmutabilidad, comparando las acciones ejecutadas contra el historial recuperado del ledger |
| | Método de verificación | Prueba |
| | 4. RELACIONES | |
| | Requisitos funcionales afectados | RF-016, RF-035 |
| | Dependencias | RNF-005 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito no funcional (7 de 30) RNF-007 — Gestión segura de sesiones | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RNF-007 |
| | Título | Gestión segura de sesiones |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | El sistema gestiona las sesiones de usuario de manera segura e impide el acceso a funcionalidades protegidas una vez finalizada la sesión. |
| | Fuente o parte interesada | Área de TI - Seguridad de la información |
| | Justificación | Complementa el control de acceso (RNF-03) evitando el uso de sesiones expiradas o cerradas para acceder a información sensible. |
| | 2. CLASIFICACIÓN | |
| | Característica ISO/IEC 25010:2023 | Seguridad (security) |
| | Subcaracterística ISO/IEC 25010:2023 | Confidencialidad |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DE LA MEDIDA | |
| | Métrica | Verificación de que una sesión cerrada o expirada no permite acceder a funcionalidades protegidas |
| | Unidad de medida | Cumple / No cumple |
| | Umbral de aceptación | Cumple (0 accesos exitosos con sesión cerrada o expirada) |
| | Condición de medición | Prueba funcional de caja negra sobre RF-007, cerrando sesión e intentando acceder a rutas protegidas |
| | Método de verificación | Prueba |
| | 4. RELACIONES | |
| | Requisitos funcionales afectados | RF-007 |
| | Dependencias | RNF-002 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito no funcional (8 de 30) RNF-008 — Limitación de exposición de información documental | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RNF-008 |
| | Título | Limitación de exposición de información documental |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | El sistema limita la exposición de información documental y de las huellas criptográficas de acuerdo con los permisos establecidos para cada rol. |
| | Fuente o parte interesada | Área de TI - Seguridad de la información |
| | Justificación | Da cumplimiento a los principios de finalidad y minimización de la Ley 1581 de 2012 [9] y a los lineamientos de la Circular Externa 005 de 2017 de la Superintendencia de Industria y Comercio [8], además del control A.8.24 del Anexo A de ISO/IEC 27001:2022 [23]. |
| | 2. CLASIFICACIÓN | |
| | Característica ISO/IEC 25010:2023 | Seguridad (security) |
| | Subcaracterística ISO/IEC 25010:2023 | Confidencialidad |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DE LA MEDIDA | |
| | Métrica | Porcentaje de campos restringidos (huella completa, datos de otros usuarios) que no son visibles para roles no autorizados |
| | Unidad de medida | Porcentaje (%) |
| | Umbral de aceptación | 100 % de los campos restringidos ocultos para roles no autorizados |
| | Condición de medición | Prueba funcional de caja negra sobre RF-018, RF-027 y RF-038 con los tres roles |
| | Método de verificación | Prueba |
| | 4. RELACIONES | |
| | Requisitos funcionales afectados | RF-018, RF-027, RF-038, RF-049 |
| | Dependencias | RNF-003 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito no funcional (9 de 30) RNF-009 — Tiempo de respuesta de las operaciones principales | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RNF-009 |
| | Título | Tiempo de respuesta de las operaciones principales |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | El sistema responde a las operaciones principales de consulta y verificación en un tiempo adecuado para garantizar una interacción fluida con el usuario. |
| | Fuente o parte interesada | Verificador / Empleado |
| | Justificación | Sustenta la usabilidad general del sistema (RNF-15) y se detalla de forma cuantitativa en RNF-10 para la operación crítica de verificación. |
| | 2. CLASIFICACIÓN | |
| | Característica ISO/IEC 25010:2023 | Eficiencia de desempeño |
| | Subcaracterística ISO/IEC 25010:2023 | Comportamiento temporal |
| | Prioridad (MoSCoW) | Debería (Should) |
| | Importancia | Media |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DE LA MEDIDA | |
| | Métrica | Tiempo de respuesta percibido en las operaciones de consulta de documentos y trazabilidad |
| | Unidad de medida | Milisegundos (ms) |
| | Umbral de aceptación | Menor o igual a 3.000 ms |
| | Condición de medición | 50 peticiones consecutivas sobre el entorno Docker local de pruebas |
| | Método de verificación | Prueba |
| | 4. RELACIONES | |
| | Requisitos funcionales afectados | RF-018, RF-021, RF-037, RF-039 |
| | Dependencias | Ninguna |
| | Comentarios | Se alinea con el mismo umbral definido para RNF-10, tomado del KPI del proyecto (Tabla 1). |
| | | |
| | | |
| Ficha de requisito no funcional (10 de 30) RNF-010 — Latencia de la verificación de integridad | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RNF-010 |
| | Título | Latencia de la verificación de integridad |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | La operación de verificación de integridad cumple como meta un percentil 95 de latencia igual o inferior a 3.000 ms en 50 peticiones consecutivas, de acuerdo con el KPI definido en el proyecto. |
| | Fuente o parte interesada | KPI OE3 del proyecto (Tabla 1) |
| | Justificación | Corresponde directamente al KPI Percentil 95 (P95) de latencia del endpoint de verificación definido para el objetivo específico de desarrollo del MVP. |
| | 2. CLASIFICACIÓN | |
| | Característica ISO/IEC 25010:2023 | Eficiencia de desempeño |
| | Subcaracterística ISO/IEC 25010:2023 | Comportamiento temporal |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DE LA MEDIDA | |
| | Métrica | Percentil 95 (P95) de la latencia del endpoint de verificación (RF-031) |
| | Unidad de medida | Milisegundos (ms) |
| | Umbral de aceptación | P95 ≤ 3.000 ms |
| | Condición de medición | 50 peticiones consecutivas sobre el endpoint de verificación en el entorno Docker local |
| | Método de verificación | Prueba |
| | 4. RELACIONES | |
| | Requisitos funcionales afectados | RF-028 a RF-034 |
| | Dependencias | RNF-009 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito no funcional (11 de 30) RNF-011 — Automatización del cálculo de huellas | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RNF-011 |
| | Título | Automatización del cálculo de huellas |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | La generación y comparación de las huellas SHA-256 se realiza de manera automática sin requerir intervención manual del usuario. |
| | Fuente o parte interesada | Alcance técnico del proyecto |
| | Justificación | Reduce el riesgo de error humano en el cálculo de la evidencia de integridad, reforzando la propiedad de efecto avalancha de SHA-256 [34]. |
| | 2. CLASIFICACIÓN | |
| | Característica ISO/IEC 25010:2023 | Eficiencia de desempeño |
| | Subcaracterística ISO/IEC 25010:2023 | Comportamiento temporal |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DE LA MEDIDA | |
| | Métrica | Verificación de que el usuario no ejecuta ningún paso manual durante el cálculo o la comparación de huellas |
| | Unidad de medida | Cumple / No cumple |
| | Umbral de aceptación | Cumple (0 pasos manuales requeridos en el cálculo de huellas) |
| | Condición de medición | Revisión del flujo de RF-014 y RF-030 en el entorno de pruebas |
| | Método de verificación | Inspección |
| | 4. RELACIONES | |
| | Requisitos funcionales afectados | RF-014, RF-030 |
| | Dependencias | Ninguna |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito no funcional (12 de 30) RNF-012 — Disponibilidad durante el periodo de pruebas | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RNF-012 |
| | Título | Disponibilidad durante el periodo de pruebas |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | El sistema permanece disponible durante el periodo definido para las pruebas y validación del MVP. |
| | Fuente o parte interesada | Alcance del proyecto (despliegue en Microsoft Azure) |
| | Justificación | El despliegue en Azure se realiza durante un periodo de prueba de un mes; su disponibilidad es necesaria para ejecutar el plan de pruebas de software (PPS). |
| | 2. CLASIFICACIÓN | |
| | Característica ISO/IEC 25010:2023 | Fiabilidad |
| | Subcaracterística ISO/IEC 25010:2023 | Disponibilidad |
| | Prioridad (MoSCoW) | Debería (Should) |
| | Importancia | Media |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DE LA MEDIDA | |
| | Métrica | Porcentaje de tiempo en que el sistema responde correctamente durante el periodo de validación |
| | Unidad de medida | Porcentaje (%) |
| | Umbral de aceptación | Mayor o igual a 95 % durante el mes de pruebas |
| | Condición de medición | Monitoreo del entorno desplegado en la máquina virtual de Azure durante la fase 4 del proyecto |
| | Método de verificación | Prueba |
| | 4. RELACIONES | |
| | Requisitos funcionales afectados | Todos los módulos funcionales |
| | Dependencias | Ninguna |
| | Comentarios | No aplica para un entorno productivo; corresponde exclusivamente a la validación del MVP. |
| | | |
| | | |
| Ficha de requisito no funcional (13 de 30) RNF-013 — Consistencia entre MongoDB y Hyperledger Fabric | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RNF-013 |
| | Título | Consistencia entre MongoDB y Hyperledger Fabric |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | La información registrada en la base de datos no relacional (MongoDB) y la evidencia almacenada en la red blockchain permisionada (Hyperledger Fabric) mantienen correspondencia respecto a los documentos, identificadores y eventos registrados. |
| | Fuente o parte interesada | Alcance técnico del proyecto |
| | Justificación | Se reemplaza el término genérico base de datos por base de datos no relacional (MongoDB) y se nombra explícitamente Hyperledger Fabric, para anclar el requerimiento al marco tecnológico definido en el proyecto. |
| | 2. CLASIFICACIÓN | |
| | Característica ISO/IEC 25010:2023 | Adecuación funcional |
| | Subcaracterística ISO/IEC 25010:2023 | Corrección funcional |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Propuesto |
| | 3. ESPECIFICACIÓN DE LA MEDIDA | |
| | Métrica | Porcentaje de documentos cuyo identificador y huella coinciden entre MongoDB y el ledger de Hyperledger Fabric |
| | Unidad de medida | Porcentaje (%) |
| | Umbral de aceptación | 100 % de correspondencia |
| | Condición de medición | Comparación cruzada de los 20 documentos sintéticos entre la base de datos y el ledger, al cierre de las pruebas de integridad |
| | Método de verificación | Prueba |
| | 4. RELACIONES | |
| | Requisitos funcionales afectados | RF-013, RF-015, RF-016 |
| | Dependencias | Ninguna |
| | Comentarios | Nota de cambio (v2) respecto a la v1. |
| | | |
| | | |
| Ficha de requisito no funcional (14 de 30) RNF-014 — Detección de alteraciones documentales | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RNF-014 |
| | Título | Detección de alteraciones documentales |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | El sistema detecta las alteraciones realizadas sobre los documentos utilizados durante las pruebas de integridad. Como meta del proyecto, debe detectar el 100 % de las alteraciones realizadas sobre los 20 documentos definidos para la validación. |
| | Fuente o parte interesada | KPI OE4 del proyecto (Tabla 1) |
| | Justificación | Corresponde directamente al KPI Tasa de detección de alteraciones documentales y se respalda en los resultados reportados por Mier Bello et al., quienes lograron una tasa de detección del 100 % en un sistema análogo basado en blockchain [30]. |
| | 2. CLASIFICACIÓN | |
| | Característica ISO/IEC 25010:2023 | Adecuación funcional |
| | Subcaracterística ISO/IEC 25010:2023 | Corrección funcional |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DE LA MEDIDA | |
| | Métrica | Tasa de detección de alteraciones sobre el conjunto de documentos sintéticos alterados |
| | Unidad de medida | Porcentaje (%) |
| | Umbral de aceptación | 100 % de los 20 documentos alterados detectados como no íntegros |
| | Condición de medición | Pruebas de mutación documental (cambios en texto, firmas y metadatos) sobre los 20 documentos sintéticos definidos en el plan de pruebas |
| | Método de verificación | Prueba |
| | 4. RELACIONES | |
| | Requisitos funcionales afectados | RF-031, RF-032, RF-034 |
| | Dependencias | RNF-005 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito no funcional (15 de 30) RNF-015 — Usabilidad sin conocimientos especializados | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RNF-015 |
| | Título | Usabilidad sin conocimientos especializados |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | La interfaz permite que los usuarios ejecuten las operaciones correspondientes a su rol de manera clara e intuitiva, sin requerir conocimientos especializados sobre blockchain o criptografía. |
| | Fuente o parte interesada | Empleado / Verificador / Administrador |
| | Justificación | El sistema está dirigido a personal administrativo y jurídico sin formación técnica en blockchain, por lo que la interfaz debe abstraer la complejidad subyacente. |
| | 2. CLASIFICACIÓN | |
| | Característica ISO/IEC 25010:2023 | Capacidad de interacción |
| | Subcaracterística ISO/IEC 25010:2023 | Operabilidad |
| | Prioridad (MoSCoW) | Debería (Should) |
| | Importancia | Media |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DE LA MEDIDA | |
| | Métrica | Porcentaje de tareas principales (carga, verificación, consulta) completadas sin asistencia por usuarios de prueba |
| | Unidad de medida | Porcentaje (%) |
| | Umbral de aceptación | Mayor o igual a 90 % de tareas completadas sin asistencia |
| | Condición de medición | Prueba de usabilidad con usuarios representativos de cada rol sobre el prototipo de alta fidelidad |
| | Método de verificación | Demostración |
| | 4. RELACIONES | |
| | Requisitos funcionales afectados | RF-008, RF-024, RF-031 |
| | Dependencias | Ninguna |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito no funcional (16 de 30) RNF-016 — Consistencia visual y de navegación | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RNF-016 |
| | Título | Consistencia visual y de navegación |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | El sistema mantiene una estructura visual y de navegación consistente entre los diferentes módulos. |
| | Fuente o parte interesada | Equipo de diseño UX/UI |
| | Justificación | Reduce la curva de aprendizaje entre módulos y refuerza la usabilidad general del sistema (RNF-15). |
| | 2. CLASIFICACIÓN | |
| | Característica ISO/IEC 25010:2023 | Capacidad de interacción |
| | Subcaracterística ISO/IEC 25010:2023 | Reconocibilidad de la adecuación |
| | Prioridad (MoSCoW) | Podría (Could) |
| | Importancia | Baja |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DE LA MEDIDA | |
| | Métrica | Verificación de que los componentes de navegación y estilo se reutilizan entre los módulos de Empleado, Verificador y Administrador |
| | Unidad de medida | Cumple / No cumple |
| | Umbral de aceptación | Cumple (mismo sistema de diseño aplicado en los tres paneles) |
| | Condición de medición | Revisión de los prototipos de Figma frente a la interfaz implementada |
| | Método de verificación | Inspección |
| | 4. RELACIONES | |
| | Requisitos funcionales afectados | RF-006 |
| | Dependencias | Ninguna |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito no funcional (17 de 30) RNF-017 — Retroalimentación sobre el resultado de las operaciones | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RNF-017 |
| | Título | Retroalimentación sobre el resultado de las operaciones |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | El sistema informa claramente al usuario sobre el resultado de las operaciones realizadas, incluyendo cargas exitosas, errores de validación, resultados de verificación y cambios de estado. |
| | Fuente o parte interesada | Empleado / Verificador |
| | Justificación | Es necesaria para que el usuario confíe en el resultado de operaciones críticas como la verificación de integridad (RF-032). |
| | 2. CLASIFICACIÓN | |
| | Característica ISO/IEC 25010:2023 | Capacidad de interacción |
| | Subcaracterística ISO/IEC 25010:2023 | Operabilidad |
| | Prioridad (MoSCoW) | Debería (Should) |
| | Importancia | Media |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DE LA MEDIDA | |
| | Métrica | Porcentaje de operaciones principales que muestran un mensaje de resultado al usuario |
| | Unidad de medida | Porcentaje (%) |
| | Umbral de aceptación | 100 % de las operaciones principales muestran retroalimentación |
| | Condición de medición | Prueba funcional de caja negra sobre los cinco módulos del sistema |
| | Método de verificación | Prueba |
| | 4. RELACIONES | |
| | Requisitos funcionales afectados | RF-017, RF-032, RF-033 |
| | Dependencias | Ninguna |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito no funcional (18 de 30) RNF-018 — Claridad de los mensajes de error | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RNF-018 |
| | Título | Claridad de los mensajes de error |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Los mensajes de error son claros e indican al usuario la causa del problema y, cuando sea posible, la acción requerida para solucionarlo. |
| | Fuente o parte interesada | Empleado / Verificador / Administrador |
| | Justificación | Complementa RNF-17 evitando que el usuario deba interpretar códigos de error técnicos. |
| | 2. CLASIFICACIÓN | |
| | Característica ISO/IEC 25010:2023 | Capacidad de interacción |
| | Subcaracterística ISO/IEC 25010:2023 | Protección frente a errores de usuario |
| | Prioridad (MoSCoW) | Podría (Could) |
| | Importancia | Baja |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DE LA MEDIDA | |
| | Métrica | Porcentaje de mensajes de error que incluyen causa y acción sugerida |
| | Unidad de medida | Porcentaje (%) |
| | Umbral de aceptación | 100 % de los mensajes de error revisados cumplen el formato definido |
| | Condición de medición | Revisión de catálogo de mensajes de error frente a los casos de prueba de validación (RF-009, RF-011, RF-025) |
| | Método de verificación | Inspección |
| | 4. RELACIONES | |
| | Requisitos funcionales afectados | RF-009, RF-011, RF-025 |
| | Dependencias | RNF-017 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito no funcional (19 de 30) RNF-019 — Separación de responsabilidades por capas | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RNF-019 |
| | Título | Separación de responsabilidades por capas |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | El sistema implementa una arquitectura modular que permite separar las responsabilidades de presentación, lógica de aplicación, integración con blockchain y persistencia. |
| | Fuente o parte interesada | Equipo de arquitectura del proyecto |
| | Justificación | Corresponde al diseño de capas (Presentación, Aplicación, Blockchain, Persistencia) definido en la fase de diseño de arquitectura del proyecto. |
| | 2. CLASIFICACIÓN | |
| | Característica ISO/IEC 25010:2023 | Mantenibilidad |
| | Subcaracterística ISO/IEC 25010:2023 | Modularidad |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DE LA MEDIDA | |
| | Métrica | Verificación de que cada capa se implementa en un componente independiente y documentado en el diagrama de arquitectura |
| | Unidad de medida | Cumple / No cumple |
| | Umbral de aceptación | Cumple (4 de 4 capas separadas y documentadas) |
| | Condición de medición | Revisión de los diagramas UML de componentes frente a la implementación |
| | Método de verificación | Inspección |
| | 4. RELACIONES | |
| | Requisitos funcionales afectados | Todos los módulos funcionales |
| | Dependencias | Ninguna |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito no funcional (20 de 30) RNF-020 — Integración indirecta con Hyperledger Fabric | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RNF-020 |
| | Título | Integración indirecta con Hyperledger Fabric |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | La comunicación entre el sistema web y Hyperledger Fabric se realiza mediante el backend, evitando que el frontend interactúe directamente con la infraestructura blockchain. |
| | Fuente o parte interesada | Equipo de arquitectura del proyecto |
| | Justificación | Esta separación está contemplada en la arquitectura propuesta en el documento y sigue el patrón de uso del Fabric SDK descrito por la documentación oficial de Hyperledger Fabric [19]. |
| | 2. CLASIFICACIÓN | |
| | Característica ISO/IEC 25010:2023 | Mantenibilidad |
| | Subcaracterística ISO/IEC 25010:2023 | Modularidad |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DE LA MEDIDA | |
| | Métrica | Verificación de que ninguna llamada del frontend se dirige directamente a los nodos de la red blockchain |
| | Unidad de medida | Cumple / No cumple |
| | Umbral de aceptación | Cumple (0 llamadas directas del frontend a la red Hyperledger Fabric) |
| | Condición de medición | Inspección del código fuente y de las trazas de red del frontend durante las pruebas funcionales |
| | Método de verificación | Inspección |
| | 4. RELACIONES | |
| | Requisitos funcionales afectados | RF-016, RF-026, RF-031 |
| | Dependencias | RNF-019 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito no funcional (21 de 30) RNF-021 — Despliegue mediante contenedores Docker | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RNF-021 |
| | Título | Despliegue mediante contenedores Docker |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Los componentes de la solución pueden ejecutarse mediante contenedores Docker y Docker Compose, de acuerdo con la arquitectura de despliegue definida para el MVP. |
| | Fuente o parte interesada | Equipo de arquitectura del proyecto |
| | Justificación | Es el mecanismo de contención y orquestación definido en el alcance técnico del proyecto para el entorno de prueba de un mes en Azure. |
| | 2. CLASIFICACIÓN | |
| | Característica ISO/IEC 25010:2023 | Flexibilidad |
| | Subcaracterística ISO/IEC 25010:2023 | Capacidad de instalación |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DE LA MEDIDA | |
| | Métrica | Porcentaje de componentes del sistema (frontend, backend, chaincode, red Hyperledger Fabric, MongoDB) desplegados como contenedores Docker |
| | Unidad de medida | Porcentaje (%) |
| | Umbral de aceptación | 100 % de los componentes contenerizados |
| | Condición de medición | Revisión del archivo docker-compose.yml y verificación de arranque completo del entorno |
| | Método de verificación | Demostración |
| | 4. RELACIONES | |
| | Requisitos funcionales afectados | Todos los módulos funcionales |
| | Dependencias | RNF-019 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito no funcional (22 de 30) RNF-022 — Extensibilidad de la arquitectura | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RNF-022 |
| | Título | Extensibilidad de la arquitectura |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | La arquitectura permite la incorporación futura de nuevos módulos o funcionalidades sin requerir una modificación completa de los componentes existentes. |
| | Fuente o parte interesada | Equipo de arquitectura del proyecto |
| | Justificación | Da continuidad al proyecto más allá del MVP, permitiendo evoluciones futuras sin rediseño total del sistema, dentro de las limitaciones declaradas (no se evalúa escalabilidad de producción). |
| | 2. CLASIFICACIÓN | |
| | Característica ISO/IEC 25010:2023 | Mantenibilidad |
| | Subcaracterística ISO/IEC 25010:2023 | Modificabilidad |
| | Prioridad (MoSCoW) | Podría (Could) |
| | Importancia | Baja |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DE LA MEDIDA | |
| | Métrica | Verificación cualitativa, mediante revisión arquitectónica, de que un nuevo módulo puede incorporarse sin modificar los módulos existentes |
| | Unidad de medida | Cumple / No cumple |
| | Umbral de aceptación | Cumple (revisión arquitectónica sin observaciones críticas) |
| | Condición de medición | Revisión de arquitectura con el director del proyecto (hito de Fase 2) |
| | Método de verificación | Análisis |
| | 4. RELACIONES | |
| | Requisitos funcionales afectados | Ninguno directamente |
| | Dependencias | RNF-019 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito no funcional (23 de 30) RNF-023 — Compatibilidad exclusiva con PDF | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RNF-023 |
| | Título | Compatibilidad exclusiva con PDF |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | El sistema es compatible exclusivamente con documentos en formato PDF dentro del alcance definido para el MVP. |
| | Fuente o parte interesada | Alcance y limitaciones del proyecto |
| | Justificación | Corresponde a la limitación funcional del proyecto, que excluye otros formatos como DOCX, XML o imágenes. |
| | 2. CLASIFICACIÓN | |
| | Característica ISO/IEC 25010:2023 | Compatibilidad |
| | Subcaracterística ISO/IEC 25010:2023 | Interoperabilidad |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DE LA MEDIDA | |
| | Métrica | Porcentaje de formatos distintos a PDF rechazados por el sistema |
| | Unidad de medida | Porcentaje (%) |
| | Umbral de aceptación | 100 % de los formatos no PDF rechazados |
| | Condición de medición | Prueba funcional de carga con archivos en formatos DOCX, XML e imágenes |
| | Método de verificación | Prueba |
| | 4. RELACIONES | |
| | Requisitos funcionales afectados | RF-009, RF-029 |
| | Dependencias | Ninguna |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito no funcional (24 de 30) RNF-024 — Límite de tamaño de archivo | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RNF-024 |
| | Título | Límite de tamaño de archivo |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | El sistema soporta documentos de hasta 20 MB por archivo. |
| | Fuente o parte interesada | Decisión técnica del equipo de desarrollo |
| | Justificación | Es un umbral de diseño definido por el equipo para preservar el rendimiento de las operaciones de hashing (RNF-09, RNF-11), sin corresponder a una norma externa. |
| | 2. CLASIFICACIÓN | |
| | Característica ISO/IEC 25010:2023 | Eficiencia de desempeño |
| | Subcaracterística ISO/IEC 25010:2023 | Capacidad |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DE LA MEDIDA | |
| | Métrica | Tamaño máximo de archivo aceptado por el sistema |
| | Unidad de medida | Megabytes (MB) |
| | Umbral de aceptación | Máximo 20 MB por archivo |
| | Condición de medición | Prueba funcional de carga con archivos de 19 MB, 20 MB y 21 MB |
| | Método de verificación | Prueba |
| | 4. RELACIONES | |
| | Requisitos funcionales afectados | RF-011, RF-029 |
| | Dependencias | Ninguna |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito no funcional (25 de 30) RNF-025 — Accesibilidad mediante navegadores modernos | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RNF-025 |
| | Título | Accesibilidad mediante navegadores modernos |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | El sistema es accesible mediante navegadores web modernos que soporten las tecnologías utilizadas para el desarrollo de la aplicación. |
| | Fuente o parte interesada | Empleado / Verificador / Administrador |
| | Justificación | Garantiza el acceso al sistema desde los navegadores estándar disponibles en los equipos de cómputo de la organización. |
| | 2. CLASIFICACIÓN | |
| | Característica ISO/IEC 25010:2023 | Flexibilidad |
| | Subcaracterística ISO/IEC 25010:2023 | Adaptabilidad |
| | Prioridad (MoSCoW) | Podría (Could) |
| | Importancia | Baja |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DE LA MEDIDA | |
| | Métrica | Número de navegadores modernos (últimas dos versiones estables) en los que el sistema opera sin errores funcionales |
| | Unidad de medida | Navegadores compatibles |
| | Umbral de aceptación | Mínimo 2 navegadores modernos verificados (por ejemplo, Chrome y Edge) |
| | Condición de medición | Prueba funcional manual sobre los navegadores seleccionados en el entorno de pruebas |
| | Método de verificación | Prueba |
| | 4. RELACIONES | |
| | Requisitos funcionales afectados | Todos los módulos funcionales |
| | Dependencias | Ninguna |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito no funcional (26 de 30) RNF-026 — Reconstrucción cronológica de acciones | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RNF-026 |
| | Título | Reconstrucción cronológica de acciones |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | El sistema permite reconstruir cronológicamente las acciones realizadas sobre cada documento mediante los registros de trazabilidad. |
| | Fuente o parte interesada | Área Jurídica y de Cumplimiento |
| | Justificación | Sustenta el valor probatorio de la trazabilidad documental, en línea con la Ley 527 de 1999 [10] y la ISO 15489-1:2016 sobre gestión de registros [22]. |
| | 2. CLASIFICACIÓN | |
| | Característica ISO/IEC 25010:2023 | Seguridad (security) |
| | Subcaracterística ISO/IEC 25010:2023 | Rendición de cuentas |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DE LA MEDIDA | |
| | Métrica | Porcentaje de documentos cuyo historial de eventos puede reconstruirse en orden cronológico completo |
| | Unidad de medida | Porcentaje (%) |
| | Umbral de aceptación | 100 % de los 20 documentos con historial reconstruible |
| | Condición de medición | Prueba de trazabilidad e inmutabilidad sobre el conjunto de documentos sintéticos |
| | Método de verificación | Prueba |
| | 4. RELACIONES | |
| | Requisitos funcionales afectados | RF-021, RF-022, RF-039, RF-040, RF-050, RF-051 |
| | Dependencias | RNF-006 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito no funcional (27 de 30) RNF-027 — Conservación del orden y del identificador de transacción | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RNF-027 |
| | Título | Conservación del orden y del identificador de transacción |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | Los eventos registrados en la red blockchain conservan su orden cronológico e identificador de transacción para facilitar su auditoría y consulta. |
| | Fuente o parte interesada | Alcance técnico del proyecto |
| | Justificación | Es la propiedad que exige agregar el campo txID en RF-022, RF-035, RF-040 y RF-051, conforme a las notas de cambio de la versión 2 del SRS. |
| | 2. CLASIFICACIÓN | |
| | Característica ISO/IEC 25010:2023 | Seguridad (security) |
| | Subcaracterística ISO/IEC 25010:2023 | No repudio |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DE LA MEDIDA | |
| | Métrica | Porcentaje de eventos del ledger que conservan un txID único y un orden cronológico verificable |
| | Unidad de medida | Porcentaje (%) |
| | Umbral de aceptación | 100 % de los eventos con txID único y orden cronológico correcto |
| | Condición de medición | Prueba de trazabilidad e inmutabilidad, comparando el orden de ejecución contra el orden recuperado del ledger |
| | Método de verificación | Prueba |
| | 4. RELACIONES | |
| | Requisitos funcionales afectados | RF-016, RF-022, RF-035, RF-040, RF-051 |
| | Dependencias | RNF-005 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito no funcional (28 de 30) RNF-028 — Porcentaje de aprobación de la suite de pruebas | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RNF-028 |
| | Título | Porcentaje de aprobación de la suite de pruebas |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | El sistema alcanza como mínimo un 90 % de casos de prueba funcionales aprobados (PASS) en la suite final de pruebas definida para el MVP. |
| | Fuente o parte interesada | KPI OE4 del proyecto (Tabla 1) |
| | Justificación | Corresponde directamente al KPI Porcentaje de casos de prueba funcionales con resultado PASS definido para el objetivo específico de evaluación del MVP. |
| | 2. CLASIFICACIÓN | |
| | Característica ISO/IEC 25010:2023 | Adecuación funcional |
| | Subcaracterística ISO/IEC 25010:2023 | Corrección funcional |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DE LA MEDIDA | |
| | Métrica | Porcentaje de casos de prueba con resultado PASS sobre el total de la suite final |
| | Unidad de medida | Porcentaje (%) |
| | Umbral de aceptación | Mayor o igual a 90 % (aproximadamente 45 de 50 casos) |
| | Condición de medición | Ejecución de la suite final de pruebas funcionales (5 módulos × 10 casos) |
| | Método de verificación | Prueba |
| | 4. RELACIONES | |
| | Requisitos funcionales afectados | Todos los módulos funcionales |
| | Dependencias | Ninguna |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito no funcional (29 de 30) RNF-029 — Condiciones controladas de evaluación | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RNF-029 |
| | Título | Condiciones controladas de evaluación |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | El rendimiento y confiabilidad del sistema se evalúan bajo las condiciones controladas establecidas para el MVP, utilizando los documentos sintéticos definidos en el plan de pruebas. |
| | Fuente o parte interesada | Alcance y limitaciones del proyecto |
| | Justificación | El proyecto no contempla pruebas de carga a escala empresarial ni escenarios de uso concurrente masivo, conforme a las limitaciones declaradas. |
| | 2. CLASIFICACIÓN | |
| | Característica ISO/IEC 25010:2023 | Mantenibilidad |
| | Subcaracterística ISO/IEC 25010:2023 | Capacidad de prueba |
| | Prioridad (MoSCoW) | Debería (Should) |
| | Importancia | Media |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DE LA MEDIDA | |
| | Métrica | Verificación de que las pruebas de rendimiento y confiabilidad se ejecutan sobre el conjunto de 20 documentos sintéticos definido |
| | Unidad de medida | Cumple / No cumple |
| | Umbral de aceptación | Cumple (pruebas ejecutadas exclusivamente sobre los 20 documentos sintéticos y el entorno Docker de prueba) |
| | Condición de medición | Revisión del Plan de Pruebas de Software (PPS) frente a su ejecución real |
| | Método de verificación | Inspección |
| | 4. RELACIONES | |
| | Requisitos funcionales afectados | Ninguno directamente |
| | Dependencias | RNF-014, RNF-028 |
| | Comentarios | — |
| | | |
| | | |
| Ficha de requisito no funcional (30 de 30) RNF-030 — Alineación con controles del Anexo A de ISO/IEC 27001:2022 | | |
| | | |
| | IDENTIFICACIÓN | |
| | ID del requisito | RNF-030 |
| | Título | Alineación con controles del Anexo A de ISO/IEC 27001:2022 |
| | Versión | 2.0 |
| | Fecha de versión | 31/08/2026 |
| | Autor | Laura Sofia Diaz Suarez; Sofia Ortiz Daza |
| | 1. CONTEXTO Y JUSTIFICACIÓN | |
| | Descripción general | El diseño del sistema considera principios y controles de seguridad relacionados con el acceso, criptografía, integridad y protección de la información, tomando como referencia los controles definidos en el Anexo A de ISO/IEC 27001:2022 contemplados en el alcance del proyecto. |
| | Fuente o parte interesada | Alcance normativo del proyecto |
| | Justificación | El proyecto centra su enfoque normativo en los controles A.8.24 (uso de criptografía) y A.8.11 (enmascaramiento de datos) del Anexo A de ISO/IEC 27001:2022 [23], sin implementar ni certificar el SGSI completo. |
| | 2. CLASIFICACIÓN | |
| | Característica ISO/IEC 25010:2023 | Seguridad (security) |
| | Subcaracterística ISO/IEC 25010:2023 | Confidencialidad |
| | Prioridad (MoSCoW) | Debe (Must) |
| | Importancia | Alta |
| | Estado | Aprobado |
| | 3. ESPECIFICACIÓN DE LA MEDIDA | |
| | Métrica | Número de controles del Anexo A adoptados como criterio de diseño (A.8.24 y A.8.11) efectivamente reflejados en la arquitectura |
| | Unidad de medida | Controles cumplidos / controles de referencia |
| | Umbral de aceptación | 2 de 2 controles de referencia (A.8.24 y A.8.11) reflejados en el diseño |
| | Condición de medición | Revisión de arquitectura frente a la matriz de trazabilidad normativa del proyecto |
| | Método de verificación | Análisis |
| | 4. RELACIONES | |
| | Requisitos funcionales afectados | RF-014, RF-015, RF-016, RF-027, RF-049 |
| | Dependencias | RNF-004, RNF-005 |
| | Comentarios | No se implementa ni evalúa el SGSI completo definido por la norma, conforme a las limitaciones del proyecto. |

## Historias_Usuario
| Historias de usuario |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Una fila por historia. Los escenarios de aceptación se registran en la hoja Criterios\_Gherkin. | | | | | | | | | | | | | | | | | | | | | | | | | | |
| La fila 7 es un ejemplo: sobrescríbela o bórrala antes de entregar. Una historia sin escenarios registrados no se puede dar por verificable. | | | | | | | | | | | | | | | | | | | | | | | | | | |
| | | | | | | | | | | | | | | | | | | | | | | | | | | |
| IDENTIFICACIÓN | | | FORMATO NARRATIVO | | | | TRAZABILIDAD | | PLANEACIÓN | | | | CRITERIOS DE ACEPTACIÓN | VERIFICACIÓN INVEST | | | | | | | DEFINICIÓN DE TERMINADO | | | | | |
| ID de la historia | Épica | Título | Como (rol) | Quiero (acción) | Para (beneficio) | Historia redactada | Requisitos funcionales asociados | Requisitos no funcionales asociados | Prioridad (MoSCoW) | Estimación (puntos de historia) | Iteración o sprint | Estado | Escenarios registrados en Gherkin | Independiente | Negociable | Valiosa | Estimable | Pequeña | Verificable | Cumple INVEST | Revisión por pares superada e integración en la rama principal del repositorio (GitHub) | Casos del Plan de Pruebas de Software (PPS) asociados a la historia ejecutados con resultado PASS | Requisitos funcionales y no funcionales del SRS actualizados según lo implementado en la historia | Historia desplegada y verificada en el entorno de prueba (Docker Compose / máquina virtual de Azure) | Aceptación registrada por el director o la codirectora del proyecto | Cumple la definición de terminado |
| HU-001 | EP-01 Autenticación y control de acceso | Selección de rol e inicio con credenciales corporativas | usuario del sistema (Empleado, Verificador o Administrador) | seleccionar mi rol e ingresar mis credenciales corporativas | iniciar el proceso de autenticación con el formulario correspondiente a mi rol | Como usuario del sistema (Empleado, Verificador o Administrador), quiero seleccionar mi rol e ingresar mis credenciales corporativas, para iniciar el proceso de autenticación con el formulario correspondiente a mi rol. | RF-001, RF-002 | RNF-02 | Debe (Must) | 3 | Sprint 1 | Por hacer | 2 | Sí | Sí | Sí | Sí | Sí | Sí | Sí | No | No | No | No | No | No |
| HU-002 | EP-01 Autenticación y control de acceso | Autenticación de doble factor y acceso por rol | usuario del sistema | validar un token de segundo factor enviado a mi correo corporativo y que el sistema confirme mi rol | acceder de forma segura únicamente a las funcionalidades autorizadas para mi rol | Como usuario del sistema, quiero validar un token de segundo factor enviado a mi correo corporativo y que el sistema confirme mi rol, para acceder de forma segura únicamente a las funcionalidades autorizadas para mi rol. | RF-003, RF-004, RF-005, RF-006 | RNF-02, RNF-03 | Debe (Must) | 5 | Sprint 1 | Por hacer | 2 | No | Sí | Sí | Sí | Sí | Sí | No | No | No | No | No | No | No |
| HU-003 | EP-01 Autenticación y control de acceso | Cierre de sesión seguro | usuario autenticado | cerrar mi sesión de forma segura | evitar que alguien más use mi sesión activa desde el mismo equipo | Como usuario autenticado, quiero cerrar mi sesión de forma segura, para evitar que alguien más use mi sesión activa desde el mismo equipo. | RF-007 | RNF-07 | Debe (Must) | 1 | Sprint 1 | Por hacer | 2 | No | Sí | Sí | Sí | Sí | Sí | No | No | No | No | No | No | No |
| HU-004 | EP-01 Autenticación y control de acceso | Cambio de contraseña | usuario autenticado | cambiar mi contraseña ingresando la actual y la nueva | mantener segura mi cuenta sin depender del administrador | Como usuario autenticado, quiero cambiar mi contraseña ingresando la actual y la nueva, para mantener segura mi cuenta sin depender del administrador. | RF-052, RF-053 | RNF-01 | Debería (Should) | 2 | Sprint 1 | Por hacer | 2 | No | Sí | Sí | Sí | Sí | Sí | No | No | No | No | No | No | No |
| HU-005 | EP-02 Registro y gestión documental (Empleado) | Carga y validación de documentos contractuales | Empleado | cargar un documento contractual en PDF de máximo 20 MB | iniciar su registro y la generación de evidencia de integridad | Como Empleado, quiero cargar un documento contractual en PDF de máximo 20 MB, para iniciar su registro y la generación de evidencia de integridad. | RF-008, RF-009, RF-010, RF-011, RF-012 | RNF-23, RNF-24 | Debe (Must) | 5 | Sprint 2 | Por hacer | 2 | No | Sí | Sí | Sí | Sí | Sí | No | No | No | No | No | No | No |
| HU-006 | EP-02 Registro y gestión documental (Empleado) | Registro de metadatos y generación de huella criptográfica | Empleado | que el sistema registre los metadatos de mi documento y calcule automáticamente su huella SHA-256 | contar con evidencia de integridad desde el momento del registro | Como Empleado, quiero que el sistema registre los metadatos de mi documento y calcule automáticamente su huella SHA-256, para contar con evidencia de integridad desde el momento del registro. | RF-013, RF-014, RF-015 | RNF-11, RNF-13 | Debe (Must) | 8 | Sprint 2 | Por hacer | 2 | No | Sí | Sí | Sí | No | Sí | No | No | No | No | No | No | No |
| HU-007 | EP-02 Registro y gestión documental (Empleado) | Registro de la huella en la red blockchain | Empleado | que la huella de mi documento quede registrada en la red Hyperledger Fabric y reciba confirmación | tener evidencia inmutable de integridad sin que se exponga el contenido del documento | Como Empleado, quiero que la huella de mi documento quede registrada en la red Hyperledger Fabric y reciba confirmación, para tener evidencia inmutable de integridad sin que se exponga el contenido del documento. | RF-016, RF-017 | RNF-04, RNF-05, RNF-20 | Debe (Must) | 8 | Sprint 2 | Por hacer | 2 | No | Sí | Sí | Sí | No | Sí | No | No | No | No | No | No | No |
| HU-008 | EP-02 Registro y gestión documental (Empleado) | Consulta de mis documentos y su estado | Empleado | consultar el listado de los documentos que he registrado con su estado actual | hacer seguimiento a mis contratos sin depender de otro canal | Como Empleado, quiero consultar el listado de los documentos que he registrado con su estado actual, para hacer seguimiento a mis contratos sin depender de otro canal. | RF-018, RF-019, RF-020 | RNF-09 | Debe (Must) | 3 | Sprint 4 | Por hacer | 2 | No | Sí | Sí | Sí | Sí | Sí | No | No | No | No | No | No | No |
| HU-009 | EP-02 Registro y gestión documental (Empleado) | Consulta de trazabilidad de mis documentos | Empleado | consultar el historial de acciones registradas sobre mis documentos | verificar qué ocurrió con cada uno y cuándo | Como Empleado, quiero consultar el historial de acciones registradas sobre mis documentos, para verificar qué ocurrió con cada uno y cuándo. | RF-021, RF-022 | RNF-06, RNF-26, RNF-27 | Debe (Must) | 5 | Sprint 4 | Por hacer | 2 | No | Sí | Sí | Sí | Sí | Sí | No | No | No | No | No | No | No |
| HU-010 | EP-03 Verificación de integridad documental (Verificador) | Selección del documento a verificar | Verificador | seleccionar un documento previamente registrado en el sistema | iniciar su proceso de verificación de integridad | Como Verificador, quiero seleccionar un documento previamente registrado en el sistema, para iniciar su proceso de verificación de integridad. | RF-023, RF-024, RF-025 | | Debe (Must) | 3 | Sprint 3 | Por hacer | 2 | No | Sí | Sí | Sí | Sí | Sí | No | No | No | No | No | No | No |
| HU-011 | EP-03 Verificación de integridad documental (Verificador) | Consulta de la huella registrada con control de visibilidad | Verificador | consultar la huella criptográfica registrada del documento seleccionado | contar con la evidencia base de comparación, respetando las restricciones de acceso por rol | Como Verificador, quiero consultar la huella criptográfica registrada del documento seleccionado, para contar con la evidencia base de comparación, respetando las restricciones de acceso por rol. | RF-026, RF-027 | RNF-08 | Debe (Must) | 3 | Sprint 3 | Por hacer | 2 | No | Sí | Sí | Sí | Sí | Sí | No | No | No | No | No | No | No |
| HU-012 | EP-03 Verificación de integridad documental (Verificador) | Carga del documento a comparar | Verificador | cargar el documento PDF que se comparará con la versión registrada | generar la huella con la que se hará la verificación | Como Verificador, quiero cargar el documento PDF que se comparará con la versión registrada, para generar la huella con la que se hará la verificación. | RF-028, RF-029 | RNF-23, RNF-24 | Debe (Must) | 3 | Sprint 3 | Por hacer | 2 | No | Sí | Sí | Sí | Sí | Sí | No | No | No | No | No | No | No |
| HU-013 | EP-03 Verificación de integridad documental (Verificador) | Comparación de huellas y resultado de la verificación | Verificador | que el sistema calcule la huella del documento cargado y la compare con la huella registrada | confirmar si la integridad del documento se mantiene o fue comprometida | Como Verificador, quiero que el sistema calcule la huella del documento cargado y la compare con la huella registrada, para confirmar si la integridad del documento se mantiene o fue comprometida. | RF-030, RF-031, RF-032, RF-033 | RNF-10, RNF-14 | Debe (Must) | 8 | Sprint 3 | Por hacer | 2 | No | Sí | Sí | Sí | No | Sí | No | No | No | No | No | No | No |
| HU-014 | EP-03 Verificación de integridad documental (Verificador) | Actualización de estado y registro de la verificación | Verificador | que el resultado de la verificación actualice el estado del documento y quede registrado en el ledger | dejar evidencia auditable de cada verificación realizada, con opción de iniciar una nueva | Como Verificador, quiero que el resultado de la verificación actualice el estado del documento y quede registrado en el ledger, para dejar evidencia auditable de cada verificación realizada, con opción de iniciar una nueva. | RF-034, RF-035, RF-036 | RNF-05, RNF-27 | Debe (Must) | 5 | Sprint 3 | Por hacer | 2 | No | Sí | Sí | Sí | Sí | Sí | No | No | No | No | No | No | No |
| HU-015 | EP-03 Verificación de integridad documental (Verificador) | Consulta general de documentos registrados | Verificador | consultar todos los documentos registrados en el sistema | ubicar cualquier documento que deba validar o auditar | Como Verificador, quiero consultar todos los documentos registrados en el sistema, para ubicar cualquier documento que deba validar o auditar. | RF-037, RF-038 | RNF-08 | Debe (Must) | 3 | Sprint 4 | Por hacer | 2 | No | Sí | Sí | Sí | Sí | Sí | No | No | No | No | No | No | No |
| HU-016 | EP-03 Verificación de integridad documental (Verificador) | Consulta general de trazabilidad | Verificador | consultar el historial completo de acciones registradas sobre cualquier documento | auditar el ciclo de vida documental de la organización | Como Verificador, quiero consultar el historial completo de acciones registradas sobre cualquier documento, para auditar el ciclo de vida documental de la organización. | RF-039, RF-040 | RNF-26, RNF-27 | Debe (Must) | 5 | Sprint 4 | Por hacer | 2 | No | Sí | Sí | Sí | Sí | Sí | No | No | No | No | No | No | No |
| HU-017 | EP-04 Administración del sistema | Panel general con resumen documental | Administrador | ver un panel con el número de documentos registrados, verificados, pendientes y alterados | dimensionar rápidamente el estado de la gestión documental | Como Administrador, quiero ver un panel con el número de documentos registrados, verificados, pendientes y alterados, para dimensionar rápidamente el estado de la gestión documental. | RF-041, RF-042 | | Debería (Should) | 3 | Sprint 4 | Por hacer | 2 | No | Sí | Sí | Sí | Sí | Sí | No | No | No | No | No | No | No |
| HU-018 | EP-04 Administración del sistema | Gestión del ciclo de vida de usuarios | Administrador | consultar, crear, editar y desactivar usuarios del sistema | mantener actualizado y controlado el acceso de Empleados y Verificadores | Como Administrador, quiero consultar, crear, editar y desactivar usuarios del sistema, para mantener actualizado y controlado el acceso de Empleados y Verificadores. | RF-043, RF-044, RF-045, RF-046, RF-047 | RNF-03 | Debe (Must) | 8 | Sprint 4 | Por hacer | 2 | No | Sí | Sí | Sí | No | Sí | No | No | No | No | No | No | No |
| HU-019 | EP-04 Administración del sistema | Consulta administrativa de documentos | Administrador | consultar todos los documentos registrados en el sistema con sus metadatos y huella | dar soporte y supervisión sobre la gestión documental de la organización | Como Administrador, quiero consultar todos los documentos registrados en el sistema con sus metadatos y huella, para dar soporte y supervisión sobre la gestión documental de la organización. | RF-048, RF-049 | RNF-04, RNF-08 | Debe (Must) | 3 | Sprint 4 | Por hacer | 2 | No | Sí | Sí | Sí | Sí | Sí | No | No | No | No | No | No | No |
| HU-020 | EP-04 Administración del sistema | Consulta administrativa de trazabilidad | Administrador | consultar el registro histórico completo de acciones sobre los documentos | auditar el uso del sistema desde una perspectiva administrativa | Como Administrador, quiero consultar el registro histórico completo de acciones sobre los documentos, para auditar el uso del sistema desde una perspectiva administrativa. | RF-050, RF-051 | RNF-26, RNF-27 | Debe (Must) | 5 | Sprint 4 | Por hacer | 2 | No | Sí | Sí | Sí | Sí | Sí | No | No | No | No | No | No | No |
| HU-021 | EP-05 Infraestructura y despliegue | Despliegue de la red blockchain permisionada y del entorno con Docker | equipo de desarrollo | desplegar la red Hyperledger Fabric, el backend, el frontend y MongoDB mediante Docker Compose | contar con un entorno reproducible donde ejecutar y validar el MVP | Como equipo de desarrollo, quiero desplegar la red Hyperledger Fabric, el backend, el frontend y MongoDB mediante Docker Compose, para contar con un entorno reproducible donde ejecutar y validar el MVP. | | RNF-19, RNF-20, RNF-21, RNF-22 | Debe (Must) | 13 | Sprint 0 | Por hacer | 2 | Sí | Sí | Sí | Sí | No | Sí | No | No | No | No | No | No | No |

## Criterios_Gherkin
| Escenarios de aceptación en Gherkin |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| Una fila por escenario. El identificador de la historia enlaza cada escenario con el backlog. | | | | | | |
| La fila 7 es un ejemplo: sobrescríbela o bórrala antes de entregar. Redacta el resultado esperado en términos observables. | | | | | | |
| | | | | | | |
| IDENTIFICACIÓN | | | ESCENARIO | | | SEGUIMIENTO |
| ID de la historia | ID del escenario | Tipo de escenario | Dado (contexto inicial) | Cuando (evento) | Entonces (resultado esperado) | Resultado de la verificación |
| HU-001 | CA-01 | Camino principal | que el usuario está en la pantalla de inicio sin sesión activa | selecciona su rol e ingresa credenciales válidas | el sistema solicita el token de segundo factor | Pendiente |
| HU-001 | CA-02 | Excepción | que el usuario ingresa credenciales inválidas | envía el formulario de autenticación | el sistema muestra un mensaje de error sin indicar cuál dato es incorrecto | Pendiente |
| HU-002 | CA-01 | Camino principal | que el usuario recibió un token vigente en su correo corporativo | lo ingresa correctamente | el sistema valida su rol y lo redirige al panel correspondiente | Pendiente |
| HU-002 | CA-02 | Excepción | que el rol seleccionado no coincide con el rol asignado al usuario | el sistema valida el acceso | lo deniega y muestra un mensaje de error | Pendiente |
| HU-003 | CA-01 | Camino principal | que el usuario tiene una sesión activa | selecciona Cerrar sesión | el sistema invalida el token de sesión y lo redirige a la pantalla de selección de rol | Pendiente |
| HU-003 | CA-02 | Alterno | que el usuario cerró sesión | intenta acceder de nuevo a una funcionalidad protegida sin autenticarse | el sistema lo redirige al inicio de sesión | Pendiente |
| HU-004 | CA-01 | Camino principal | que el usuario autenticado ingresa su contraseña actual correcta y una nueva contraseña válida | confirma el cambio | el sistema actualiza la contraseña almacenada como hash con sal | Pendiente |
| HU-004 | CA-02 | Excepción | que la contraseña actual ingresada es incorrecta | se envía el formulario de cambio de contraseña | el sistema rechaza el cambio e informa el error | Pendiente |
| HU-005 | CA-01 | Camino principal | que el Empleado selecciona un archivo PDF de 10 MB | lo carga en el formulario de registro | el sistema valida formato y tamaño y continúa con el registro | Pendiente |
| HU-005 | CA-02 | Excepción | que el Empleado selecciona un archivo DOCX o un PDF de 25 MB | intenta cargarlo | el sistema lo rechaza e informa el motivo | Pendiente |
| HU-006 | CA-01 | Camino principal | un documento que superó las validaciones de carga | el sistema lo registra | genera sus metadatos y calcula su huella SHA-256 de forma automática | Pendiente |
| HU-006 | CA-02 | Alterno | un documento ya registrado | se genera su huella nuevamente sobre el mismo contenido | el resultado es exactamente el mismo hash | Pendiente |
| HU-007 | CA-01 | Camino principal | que la huella del documento fue generada | el backend la envía al chaincode | la red Hyperledger Fabric la registra y retorna un txID válido | Pendiente |
| HU-007 | CA-02 | Excepción | que el registro en la red blockchain falla | el sistema procesa la respuesta | no muestra un mensaje de éxito al Empleado | Pendiente |
| HU-008 | CA-01 | Camino principal | un Empleado con documentos registrados | consulta Mis documentos | ve únicamente los documentos que él cargó con su estado actual | Pendiente |
| HU-008 | CA-02 | Alterno | un documento sin verificaciones previas | se consulta su estado | su estado es Pendiente | Pendiente |
| HU-009 | CA-01 | Camino principal | un documento con eventos registrados | el Empleado consulta su trazabilidad | ve el historial completo en orden cronológico con documento, acción, usuario, txID, fecha y hora | Pendiente |
| HU-009 | CA-02 | Excepción | un documento que no pertenece al Empleado autenticado | intenta consultar su trazabilidad | el sistema le deniega el acceso | Pendiente |
| HU-010 | CA-01 | Camino principal | un documento previamente registrado | el Verificador lo selecciona | el sistema confirma su existencia y continúa el flujo de verificación | Pendiente |
| HU-010 | CA-02 | Excepción | un identificador de documento que no existe | se consulta | el sistema informa que el documento no está registrado | Pendiente |
| HU-011 | CA-01 | Camino principal | un documento existente | el Verificador consulta su huella | el sistema muestra el hash SHA-256 registrado | Pendiente |
| HU-011 | CA-02 | Excepción | un usuario con rol Empleado | intenta ver la huella completa de un documento ajeno | el sistema le deniega el acceso | Pendiente |
| HU-012 | CA-01 | Camino principal | un archivo PDF válido cargado por el Verificador | se envía | el sistema inicia su validación de formato y tamaño | Pendiente |
| HU-012 | CA-02 | Excepción | un archivo de 30 MB | se valida | el sistema lo rechaza e informa el límite permitido | Pendiente |
| HU-013 | CA-01 | Camino principal | dos huellas idénticas entre el documento registrado y el cargado | se comparan | el sistema muestra Integridad confirmada | Pendiente |
| HU-013 | CA-02 | Alterno | dos huellas distintas | se comparan | el sistema muestra Integridad comprometida y presenta ambas huellas como evidencia | Pendiente |
| HU-014 | CA-01 | Camino principal | un resultado de verificación con huellas coincidentes | se procesa | el estado del documento cambia a Verificado y el evento queda registrado en el ledger con su txID | Pendiente |
| HU-014 | CA-02 | Alterno | que el Verificador concluyó una verificación | selecciona Nueva verificación | el sistema muestra el formulario vacío de selección de documento | Pendiente |
| HU-015 | CA-01 | Camino principal | que el Verificador accede al listado de documentos | lo consulta | ve todos los documentos registrados con sus seis campos mínimos | Pendiente |
| HU-015 | CA-02 | Excepción | un documento cuya huella no está autorizada para el rol consultante | se lista | el campo de huella se muestra restringido | Pendiente |
| HU-016 | CA-01 | Camino principal | que el Verificador accede a la trazabilidad general | la consulta | ve los eventos de todos los documentos registrados en orden cronológico | Pendiente |
| HU-016 | CA-02 | Alterno | el conjunto de eventos del ledger | se listan | se muestran los seis campos definidos (Documento, Acción, Usuario, txID, Fecha, Resultado) | Pendiente |
| HU-017 | CA-01 | Camino principal | que el Administrador inicia sesión | accede al panel general | ve el resumen documental consolidado con los cuatro totales definidos | Pendiente |
| HU-017 | CA-02 | Alterno | un conjunto de documentos con distintos estados | se calcula el resumen | la suma de los totales por estado coincide con el total general | Pendiente |
| HU-018 | CA-01 | Camino principal | que el Administrador diligencia el formulario de creación de usuario con un correo no registrado | confirma la creación | el sistema crea el usuario en estado Activo con uno de los tres roles predefinidos | Pendiente |
| HU-018 | CA-02 | Excepción | un usuario activo con documentos previamente registrados | el Administrador lo desactiva | conserva su historial de trazabilidad y ya no puede iniciar sesión | Pendiente |
| HU-019 | CA-01 | Camino principal | que el Administrador accede al listado de documentos | lo consulta | ve todos los documentos registrados con sus seis campos mínimos, sin exponer el contenido del archivo | Pendiente |
| HU-019 | CA-02 | Alterno | un documento registrado | se lista para el Administrador | se muestran los mismos campos mínimos definidos para el rol Verificador | Pendiente |
| HU-020 | CA-01 | Camino principal | que el Administrador accede a la trazabilidad | la consulta | ve los eventos de todos los documentos registrados con txID y Resultado | Pendiente |
| HU-020 | CA-02 | Alterno | el nivel de detalle mostrado al Verificador en RF-040 | se compara con el panel del Administrador | el Administrador ve un nivel de detalle igual o mayor | Pendiente |
| HU-021 | CA-01 | Camino principal | el archivo docker-compose.yml del proyecto | se ejecuta en el entorno de pruebas | todos los componentes (frontend, backend, chaincode, red Hyperledger Fabric, MongoDB) arrancan correctamente como contenedores | Pendiente |
| HU-021 | CA-02 | Alterno | que el frontend necesita interactuar con la red blockchain | se revisa el código fuente | ninguna llamada del frontend se dirige directamente a los nodos de Hyperledger Fabric | Pendiente |

## Definición_Terminado
| Definición de terminado |  |  |
| --- | --- | --- |
| Acuerdo único del equipo. Cada criterio se convierte en una columna de la hoja Historias\_Usuario. | | |
| Puedes reescribir los cinco criterios; los encabezados del backlog se actualizan solos. | | |
| | Criterio de terminado | Evidencia que lo sustenta |
| | Revisión por pares superada e integración en la rama principal del repositorio (GitHub) | Enlace a la solicitud de incorporación (pull request) aprobada en el repositorio del proyecto |
| | Casos del Plan de Pruebas de Software (PPS) asociados a la historia ejecutados con resultado PASS | Reporte de ejecución de la suite de pruebas (PPS) para los casos vinculados a la historia |
| | Requisitos funcionales y no funcionales del SRS actualizados según lo implementado en la historia | Identificadores RF y RNF referenciados en la hoja de trazabilidad (RF y RNF de este libro) |
| | Historia desplegada y verificada en el entorno de prueba (Docker Compose / máquina virtual de Azure) | Número de versión de la imagen y fecha del despliegue en el entorno de prueba |
| | Aceptación registrada por el director o la codirectora del proyecto | Acta o registro de la sesión de revisión con el director o la codirectora |

## Listas
| Catálogos de valores |  |  |  |  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Alimentan las listas desplegables de las hojas de captura. | | | | | | | | | | | |
| Para ampliar un catálogo escribe dentro del rango existente; si agregas filas al final, actualiza el nombre definido. | | | | | | | | | | | |
| | | | | | | | | | | | |
| | | | | | | | | | | | |
| Subcaracterística ISO/IEC 25010:2023 | Característica ISO/IEC 25010:2023 | | Prioridad (MoSCoW) | Importancia | Estado del requisito | Método de verificación | Confirmación | Puntos de historia | Tipo de escenario | Resultado de la verificación | Estado de la historia |
| Completitud funcional | Adecuación funcional | | Debe (Must) | Alta | Propuesto | Inspección | Sí | 1 | Camino principal | Pendiente | Por hacer |
| Corrección funcional | Adecuación funcional | | Debería (Should) | Media | Aprobado | Análisis | No | 2 | Alterno | Aprobado | En curso |
| Pertinencia funcional | Adecuación funcional | | Podría (Could) | Baja | Implementado | Demostración | | 3 | Excepción | Fallido | En verificación |
| Comportamiento temporal | Eficiencia de desempeño | | No por ahora (Won't) | | Verificado | Prueba | | 5 | | | Terminada |
| Utilización de recursos | Eficiencia de desempeño | | | | Rechazado | | | 8 | | | |
| Capacidad | Eficiencia de desempeño | | | | | | | 13 | | | |
| Coexistencia | Compatibilidad | | | | | | | 21 | | | |
| Interoperabilidad | Compatibilidad | | | | | | | | | | |
| Reconocibilidad de la adecuación | Capacidad de interacción | | | | | | | | | | |
| Aprendizabilidad | Capacidad de interacción | | | | | | | | | | |
| Operabilidad | Capacidad de interacción | | | | | | | | | | |
| Protección frente a errores de usuario | Capacidad de interacción | | | | | | | | | | |
| Compromiso del usuario | Capacidad de interacción | | | | | | | | | | |
| Inclusividad | Capacidad de interacción | | | | | | | | | | |
| Asistencia al usuario | Capacidad de interacción | | | | | | | | | | |
| Autodescripción | Capacidad de interacción | | | | | | | | | | |
| Ausencia de fallos | Fiabilidad | | | | | | | | | | |
| Disponibilidad | Fiabilidad | | | | | | | | | | |
| Tolerancia a fallos | Fiabilidad | | | | | | | | | | |
| Capacidad de recuperación | Fiabilidad | | | | | | | | | | |
| Confidencialidad | Seguridad (security) | | | | | | | | | | |
| Integridad | Seguridad (security) | | | | | | | | | | |
| No repudio | Seguridad (security) | | | | | | | | | | |
| Rendición de cuentas | Seguridad (security) | | | | | | | | | | |
| Autenticidad | Seguridad (security) | | | | | | | | | | |
| Resistencia | Seguridad (security) | | | | | | | | | | |
| Modularidad | Mantenibilidad | | | | | | | | | | |
| Reusabilidad | Mantenibilidad | | | | | | | | | | |
| Analizabilidad | Mantenibilidad | | | | | | | | | | |
| Modificabilidad | Mantenibilidad | | | | | | | | | | |
| Capacidad de prueba | Mantenibilidad | | | | | | | | | | |
| Adaptabilidad | Flexibilidad | | | | | | | | | | |
| Escalabilidad | Flexibilidad | | | | | | | | | | |
| Capacidad de instalación | Flexibilidad | | | | | | | | | | |
| Capacidad de reemplazo | Flexibilidad | | | | | | | | | | |
| Restricción operativa | Seguridad física (safety) | | | | | | | | | | |
| Identificación de riesgos | Seguridad física (safety) | | | | | | | | | | |
| Fallo seguro | Seguridad física (safety) | | | | | | | | | | |
| Advertencia de peligros | Seguridad física (safety) | | | | | | | | | | |
| Integración segura | Seguridad física (safety) | | | | | | | | | | |

## Referencias_Adicionales
| Referencias adicionales (formato IEEE) |  |  |
| --- | --- | --- |
| Fuentes utilizadas para elaborar esta plantilla de requisitos que NO forman parte de la bibliografía del trabajo de grado. Las referencias que sí provienen del proyecto se citan dentro de cada requisito con el número correspondiente a la numeración vigente del documento final (por ejemplo, [23] para ISO/IEC 27001:2022, [10] para la Ley 527 de 1999, [9] para la Ley 1581 de 2012, [19] para la documentación de Hyperledger Fabric, [31] para la guía del MinTIC, [34] para NIST FIPS 202/SHA-256, [36] para el Decreto 2364 de 2012, [22] para ISO 15489-1:2016, [30] para Mier Bello et al., [7] para la Sentencia SP248-2025 de la Corte Suprema de Justicia y [8] para la Circular Externa 005 de 2017 de la Superintendencia de Industria y Comercio). | | |
| | | |
| N.° | Referencia en formato IEEE | Uso dentro de este libro |
| N-1 | International Organization for Standardization, ISO/IEC/IEEE 29148:2018 — Systems and software engineering — Life cycle processes — Requirements engineering, Geneva, Switzerland: ISO/IEC/IEEE, 2018. | Estructura y criterios de calidad (necesario, no ambiguo, verificable, etc.) usados para especificar y revisar cada requisito funcional y no funcional en las hojas RF y RNF. |
| N-2 | International Organization for Standardization, ISO/IEC 25010:2023 — Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — Product quality model, Geneva, Switzerland: ISO, 2023. | Modelo de características y subcaracterísticas de calidad utilizado para clasificar cada requisito no funcional en la hoja RNF (columnas Característica y Subcaracterística). |