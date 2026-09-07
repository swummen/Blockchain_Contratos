TRABAJO DE GRADO
MVP DE UN SISTEMA WEB PARA LA VERIFICACIÓN DE INTEGRIDAD Y
TRAZABILIDAD DOCUMENTAL EN CONTRATOS LABORALES MEDIANTE
BLOCKCHAIN PERMISIONADA
LAURA SOFIA DIAZ SUAREZ
SOFIA ORTIZ DAZA
UNIVERSIDAD CATÓLICA DE COLOMBIA
FACULTAD DE INGENIERÍA
PROGRAMA DE INGENIERÍA DE SISTEMAS Y COMPUTACIÓN
BOGOTÁ D.C
2026

TRABAJO DE GRADO
MVP DE UN SISTEMA WEB PARA LA VERIFICACIÓN DE INTEGRIDAD Y
TRAZABILIDAD DOCUMENTAL EN CONTRATOS LABORALES MEDIANTE
BLOCKCHAIN PERMISIONADA
LAURA SOFIA DIAZ SUAREZ
SOFIA ORTIZ DAZA
Trabajo de grado presentado para optar al título de Ingeniero de Sistemas y
Computación
JUAN CARLOS NAVARRO BELTRÁN
MSc en Ingeniería de Telecomunicaciones
Director
SOLANGIE PAOLA GARAVITO MENDIVELSO
MSc
Codirectora
UNIVERSIDAD CATÓLICA DE COLOMBIA
FACULTAD DE INGENIERÍA
PROGRAMA DE INGENIERÍA DE SISTEMAS Y COMPUTACIÓN
BOGOTÁ D.C
2026

|     |     |     |
| --- | --- | --- |

CONTENIDO

| 1.  INTRODUCCIÓN           |     | 11  |
| -------------------------- | --- | --- |
| 2.  CONTEXTO DEL PROYECTO  |     | 13  |
2.1 Tipo de Propuesta ........................................................................................ 13
2.2 Planteamiento del problema ......................................................................... 13
2.3 Pregunta de investigación ............................................................................ 15
2.4 Justificación .................................................................................................. 15
2.5 Antecedentes del proyecto ........................................................................... 17
2.6 Alcance y limitaciones .................................................................................. 18
| 2.6.1 Alcances      |     | 18  |
| ------------------- | --- | --- |
| 2.6.2 Limitaciones  |     | 20  |
| 3.  OBJETIVOS       |     | 22  |
3.1. Objetivo General ......................................................................................... 22
3.2. Objetivos Específicos .................................................................................. 22
3.3. Indicadores Clave de Desempeño (KPIs).................................................... 22
| Fuente: Elaborado por las autoras a partir de [33]  |     | 23  |
| --------------------------------------------------- | --- | --- |
| 4.  MARCOS DE REFERENCIA                            |     | 24  |
4.1. Marco conceptual ........................................................................................ 24
4.2. Marco teórico ............................................................................................... 25
4.2.1. Verificación de integridad documental mediante criptografía  25
4.2.2. Blockchain permisionada como infraestructura de registro inmutable  26
4.2.3. Hyperledger Fabric como plataforma de implementación  27
| 4.2.4. Chaincode y automatización de lógica documental  |     | 28  |
| ------------------------------------------------------- | --- | --- |
4.2.5. Patrones de diseño en sistemas documentales con blockchain  28
| 4.2.6. Plan de pruebas y evaluación del sistema  |     | 29  |
| ------------------------------------------------ | --- | --- |
4.3. Marco jurídico .............................................................................................. 30
| 4.3.1. Estándares internacionales  |     | 30  |
| ---------------------------------- | --- | --- |
| 4.3.2. Marco normativo colombiano  |     | 30  |
| 5.  ESTADO DEL ARTE                |     | 32  |
| 6.  METODOLOGÍA                    |     | 34  |
6.1. Diseño de la Investigación ........................................................................... 34
6.2. Ciclo de Vida del Software (SDLC): Prototipado Evolutivo .......................... 34
6.3. Fases del Proyecto y Correspondencia con Objetivos ................................ 35

|     |     |     |
| --- | --- | --- |

6.4. Instrumentos y Herramientas ...................................................................... 38
| 7.  PRODUCTO A ENTREGAR  |     | 39  |
| ------------------------ | --- | --- |
7.1 Valor empresarial del sistema propuesto ..................................................... 39
7.2. Seguridad por módulo del sistema .............................................................. 41
| 8.  CRONOGRAMA       |     | 42  |
| -------------------- | --- | --- |
| 9.  PRESUPUESTO      |     | 43  |
| 10. 10. REFERENCIAS  |     | 44  |
| 11. ANEXOS           |     | 48  |

|     |     |     |
| --- | --- | --- |

LISTA DE TABLAS
| TABLA 1. ESTRUCTURA GENERAL DE LOS KPIS  |     | 22  |
| ---------------------------------------- | --- | --- |
| TABLA 2. INSTRUMENTOS Y HERRAMIENTAS     |     | 38  |
TABLA 3. DESCRIPCIÓN DE COMPONENTES DEL PRODUCTO A ENTREGAR  39
TABLA 4. PROBLEMAS, SOLUCIONES Y RESULTADOS ESPERADOS DEL SISTEMA  40
| TABLA 5. CRONOGRAMA   |     | 42  |
| --------------------- | --- | --- |
| TABLA 6. PRESUPUESTO  |     | 43  |

LISTA DE FIGURAS
FIGURA 1. METODOLOGÍA CICLO DE VIDA PROTOTIPADO 34
FIGURA 2. PROCESO DE METODOLOGÍA DEL PROYECTO 35

GLOSARIO
HASH CRIPTOGRÁFICO
Resultado de aplicar una función matemática a un conjunto de datos, generando
una cadena única de longitud fija que representa su contenido. Se utiliza para
garantizar la integridad de la información.
SHA-256
Algoritmo de función hash perteneciente a la familia SHA-2, que genera una huella
digital de 256 bits. Es ampliamente utilizado en sistemas de seguridad y
blockchain para verificar la integridad de los datos.
SAL (SALT)
Valor aleatorio que se añade a una contraseña antes de aplicar una función hash,
con el fin de aumentar la seguridad y evitar ataques.
BCRYPT
Algoritmo de hashing diseñado para el almacenamiento seguro de contraseñas,
que incorpora automáticamente el uso de sal y múltiples iteraciones para dificultar
ataques de fuerza bruta.
TOKEN JWT (JSON WEB TOKEN)
Mecanismo de autenticación basado en tokens que permite transmitir información
segura entre cliente y servidor mediante un objeto firmado digitalmente.
AUTENTICACIÓN
Proceso mediante el cual un sistema verifica la identidad de un usuario o entidad
antes de permitir el acceso a recursos.
AUTORIZACIÓN
Proceso posterior a la autenticación que determina los permisos y niveles de
acceso que posee un usuario dentro de un sistema.
CERTIFICADO DIGITAL X.509
Documento electrónico que vincula una identidad con una clave pública, utilizado
en infraestructuras de clave pública (PKI) para autenticar entidades en redes
seguras.
BLOCKCHAIN
Tecnología de registro distribuido que permite almacenar información de forma
descentralizada, segura e inmutable mediante una cadena de bloques enlazados
criptográficamente.
RED BLOCKCHAIN PERMISIONADA
Tipo de red blockchain en la que el acceso y la participación están restringidos a

entidades previamente autorizadas, permitiendo mayor control sobre identidad y
gobernanza.
HYPERLEDGER FABRIC
Plataforma blockchain empresarial de código abierto, diseñada para redes
permisionadas, que permite definir políticas de acceso, identidad y ejecución de
contratos inteligentes en entornos organizacionales.
LEDGER (LIBRO MAYOR)
Registro distribuido donde se almacenan de forma cronológica e inmutable todas
las operaciones o eventos realizados dentro de una red blockchain.
INMUTABILIDAD
Propiedad de un sistema que impide la modificación o eliminación de datos una
vez han sido registrados, garantizando su integridad a lo largo del tiempo.
TRAZABILIDAD
Capacidad de rastrear y reconstruir el historial de eventos o acciones asociadas a
un elemento, permitiendo conocer su origen, modificaciones y estado a lo largo del
tiempo.
CHAINCODE
Programa o contrato inteligente desplegado en Hyperledger Fabric que define la
lógica de negocio y las operaciones que pueden ejecutarse sobre el ledger.
NODO
Entidad participante dentro de una red blockchain que mantiene una copia del
ledger y contribuye a la validación y ejecución de operaciones.
INTEGRIDAD DOCUMENTAL
Propiedad que garantiza que un documento no ha sido alterado desde su creación
o registro, manteniendo su contenido original de forma verificable.
DOCUMENTO ELECTRÓNICO
Archivo digital que contiene información estructurada y que puede ser
almacenado, transmitido o procesado mediante sistemas informáticos.
FIRMA DIGITAL
Mecanismo criptográfico que permite validar la identidad del firmante y garantizar
la integridad de un documento electrónico mediante el uso de claves públicas y
privadas.
METADATOS
Datos descriptivos asociados a un documento, como fecha de creación, autor o
identificador, que permiten su gestión, clasificación y trazabilidad.

HUELLA DIGITAL DEL DOCUMENTO
Representación única de un documento generada mediante una función hash,
utilizada para verificar su integridad sin necesidad de almacenar el archivo original.
API REST
Estilo de arquitectura para el diseño de servicios web que permite la comunicación
entre sistemas mediante solicitudes HTTP y el uso de recursos identificados por
URL.
BACKEND
Componente de un sistema que gestiona la lógica de negocio, el procesamiento
de datos y la comunicación con bases de datos o servicios externos.
FRONTEND
Parte del sistema con la que interactúa el usuario, encargada de la presentación
visual y la experiencia de uso.
DOCKER
Plataforma de virtualización ligera que permite empaquetar aplicaciones y sus
dependencias en contenedores, facilitando su despliegue y ejecución en distintos
entornos.
BENCHMARKING
Proceso de evaluación comparativa que consiste en analizar el rendimiento,
características o resultados de un sistema frente a otros referentes o estándares,
con el fin de identificar mejoras o validar su desempeño.

RESUMEN
Hoy en día es cada vez más común que los contratos laborales se manejen de forma
digital, sobre todo en el sector de TI. Sin embargo, varios de estos documentos son
administrados por sistemas viejos o tradicionales los cuales no pueden garantizar
que la integridad, autenticidad y trazabilidad del documento sean confiables. Esto
hace que se generen riesgos relacionados con la alteración de la información
haciendo que este pierda su valor como evidencia digital.
En el sector colombiano, el marco normativo reconoce la validez jurídica de los
documentos electrónicos, pero estos deben cumplir con las condiciones de
integridad y verificabilidad que estos proponen. En algunos casos, estas
condiciones so se cumplen dentro de los mecanismos de gestión documental,
generando un escenario evidente. La necesidad de implementar nuevas soluciones
tecnológicas que ayuden a fortalecer la confiabilidad de los registros digitales.
Ante esta problemática nace el presente proyecto, el cual propone el desarrollo de
un MVP de un sistema web integrado a una red permisionada blockchain basada
en Hyperledger Fabric, con el objetivo de verificar la integridad y la trazabilidad de
contratos laborales. Esta solución tiene como base la generación de huellas
criptográficas, o también conocidos como "hash", de los documentos. Estas huellas
se registran en la red junto con los eventos necesarios para su gestión sin necesidad
de almacenar directamente el archivo en la red blockchain.
Para el desarrollo del sistema, se dividirá en 2 partes, el frontend desarrollado en
React y el backend en Node.js, con una infraestructura basada en contenedores
Dockers. Esto con el propósito de que el MVP demuestre que tan viable es la técnica
de uso de la red blockchain como mecanismo de verificación de la integridad
documental. Así mismo, contribuir con la mejora de la seguridad, trazabilidad y
confiabilidad de los contratos laborales en entornos digitales.
PALABRAS CLAVE: Blockchain, Cryptography, Data integrity, Smart contracts,
Web sites, Prototyping, Access control, Traceability, Distributed databases,
Computer security, Digital signatures, Application software.

1. INTRODUCCIÓN
El sector de TI en Colombia ha experimentado un crecimiento constante el cual
genera que los procesos contractuales se digitalicen, haciendo que toda la gestión
de contratos laborales y acuerdos de confidencialidad migren a entornos más
digitales. Pero esto también tiene sus desventajas, este crecimiento puede
presentar errores estructurales importantes cuando los documentos son
gestionados como archivos digitales convencionales, por ejemplo: importantes
cuando los documentos son gestionados como archivos digitales convencionales,
compartidos por correo electrónico o almacenados en repositorios en la nube sin
mecanismos técnicos que garanticen su integridad, autenticidad ni trazabilidad a lo
largo de su ciclo de vida [3]. Para este tipo de contextos existen leyes cómo: la Ley
527 de 1999 exige que la validez jurídica de un mensaje de datos dependa de la
demostrabilidad de su integridad [2]. El Decreto 2364 de 2012 establece que los
mecanismos de firma electrónica deben permitir identificar al firmante y asociarlo
con el contenido suscrito [9]. A pesar de esto, muchas organizaciones continúan
utilizando firmas digitalizadas que no ofrecen las garantías requeridas [6], creando
una brecha técnica y jurídica que incrementa el riesgo de alteraciones documentales
no detectables, disputas contractuales y debilidad probatoria [8].
Ante esta problemática, el presente trabajo de grado propone el desarrollo de un
Producto Mínimo Viable (MVP) de un sistema web integrado con una red blockchain
permisionada Hyperledger Fabric orientado a la verificación de integridad y
trazabilidad documental en contratos laborales y acuerdos de confidencialidad en
formato PDF, en el contexto de una empresa del sector de servicios tecnológicos
en Bogotá [1, 18]. El objeto de estudio es el proceso de gestión contractual digital
de dicha organización, donde se identificaron deficiencias específicas en el control
de versiones, la verificación de integridad y la capacidad probatoria de los
documentos.
Una vez se tengan los datos analizados, se hace levantamiento de requerimientos
funcionales, normativos y técnicos, entrevistas semiestructuradas y un
benchmarking comparativo para evaluar la competencia. Una vez se tenga esa
información completa, se construye un stack donde está la base del proyecto: React,
Node.js, Hyperledger Fabric, MongoDB y Docker. para luego ser evaluado mediante
un plan de pruebas dividida en 4 partes para evaluar la modificación en documentos
sintéticos, pruebas funcionales de caja negra, verificación de la trazabilidad e
inmutabilidad de red permisionada, así como su medición de latencias operativas
[37, 31].

Finalmente, se espera que el proyecto genere un impacto positivo haciendo que el
sistema de la empresa de objeto de estudio fortalezca la gestión documental
contractual al desplazar su modelo tradicional a un modelo más técnico y objetivo,
mejorando así la capacidad de verificar la integridad en contratos, reduciendo la
necesidad de análisis posteriores y aportando una base técnica replicable para
modernizar los procesos de gestión documental de esta organización [1, 20, 3].

2. CONTEXTO DEL PROYECTO
2.1 Tipo de Propuesta
El presente proyecto se desarrolla bajo un enfoque de investigación en el cual se
identifica, diseña, desarrolla y evalúa un MVP funcional que busca responder a una
problemática real relacionada a la gestión documental contractual digital en el sector
de TI de Colombia. Se propone una solución tecnológica sustentada en la revisión
bibliográfica y el análisis del marco normativo.
2.2 Planteamiento del problema
El sector de TI en Colombia a través del tiempo se ha convertido en uno de los
ámbitos con una gran importancia en la parte nacional de la economía digital, pues
esto se debe al crecimiento que se ha evidenciado en el aumento de la demanda
de servicios tecnológicos, la transformación en organizaciones y la necesidad de
contratar personas capacitadas [1]. A partir de esto, ha incrementado la rotación
laboral, teniendo en consecuencia una gran cantidad de documentos contractuales
gestionados por las organizaciones; como lo son contratos laborales o acuerdos de
confidencialidad (NDA), registros esenciales que sirven para formalizar relaciones
laborales, regular obligaciones y proteger información estratégica.
En este contexto, la manera en que se manejan los documentos ha cambiado a un
entorno mayormente digital, en donde desde su elaboración hasta su consulta se
realiza principalmente mediante archivos electrónicos, usualmente en formato PDF,
compartidos por correo electrónico o que están protegidos en servicios de
almacenamiento en la nube [2]. Sin embargo, este proceso genera limitaciones a
pesar de sus beneficios, pues el control documental queda vulnerado,
especialmente en lo relacionado con la verificación de integridad, autenticidad y
trazabilidad [3].
En diversas empresas de tecnología los contratos y acuerdos de confidencialidad
se siguen guardando como archivos digitales tradicionales que incluyen una foto o
imagen de la firma de la persona, en lugar de una firma digital segura y verificable.
Ante la visión jurídica, se considera que este proceso no cumple con las condiciones
técnicas de autenticidad e integridad documental. De acuerdo con la Ley 527 de
1999, una firma digital corresponde a un valor numérico asociado a un mensaje de
datos y vinculado a un procedimiento criptográfico que permite identificar al firmante
y detectar alteraciones posteriores en la información [2]. Por otra parte, el Decreto
2364 de 2012 reglamenta la firma electrónica en Colombia y establece las
condiciones bajo las cuales puede utilizarse como mecanismo de autenticación en
entornos digitales [9]. En consecuencia, una firma digitalizada no brinda la seguridad
necesaria para comprobar quién firmó el documento, ni garantizar que su contenido
no haya sido modificado.

Esta limitación se convierte en un punto débil dentro del proceso de gestión
documental de los contratos, ya que los documentos pueden ser replicados,
reenviados, modificados o sustituidos sin que exista una prueba confiable para
verificar cuál corresponde a la versión original, si su contenido se alteró o si el
archivo aún conserva las condiciones iniciales [6]. Cuando un contrato se comparte
entre diferentes personas puede resultar difícil saber cuál es la versión más reciente
o si el documento ha sido modificado. La falta de control de versiones, registros de
fecha verificables y mecanismos de seguridad aumenta la incertidumbre sobre la
autenticidad, validez e integridad del documento [4].
Desde una perspectiva operativa, las dificultades aparecen cuando se necesita
detectar a tiempo modificaciones no autorizadas en cláusulas, fechas, obligaciones
o condiciones contractuales. Al ser documentos digitales convencionales, pueden
modificarse sin que exista un registro de los cambios realizados. Esto representa un
problema significativo en un entorno donde el aumento de incidentes relacionados
con ciber fraude y manipulación documental incrementa los riesgos para la
seguridad y confiabilidad [18].
Desde el punto de vista legal, la falta de mecanismos técnicos de verificación
dificulta demostrar que un documento es auténtico y que no ha sido modificado.
Esto puede generar problemas en disputas contractuales, conflictos laborales,
auditorías o procesos judiciales [16]. En estas situaciones, suele ser necesario
recurrir a revisiones manuales o análisis informáticos especializados para validar el
documento, lo que aumenta los costos, demora la resolución de los casos y reduce
la confianza en el documento como evidencia digital [8].
Todo este problema cobra relevancia cuando se trata de documentos que están
asociados a acuerdos de confidencialidad y cláusulas de propiedad intelectual,
donde si ocurre una alteración sin que se genere un aviso puede generar dilemas
de incumplimientos contractuales, disputas sobre obligaciones pactadas o
exposición indebida de información sensible para la organización. Teniendo eso en
cuenta, la ausencia de un proceso confiable no es lo único que compromete la
integridad, sino también un riesgo operativo, jurídico y estratégico [8].
Si bien esta problemática se presenta en diferentes organizaciones del sector TI
colombiano, el presente proyecto centra su análisis en una empresa de servicios
tecnológicos ubicada en Bogotá. En esta organización se identificaron dificultades
relacionadas con la gestión de contratos digitales, particularmente en la verificación
de la integridad de los documentos, el control de versiones y el seguimiento de los
cambios realizados sobre los registros contractuales.
En este sentido, se identifica la necesidad de una solución tecnológica que permita
fortalecer la gestión documental contractual de la organización objeto de estudio

mediante mecanismos que garanticen la integridad del contenido, la trazabilidad de
los eventos asociados al documento y la posibilidad de verificar su estado durante
su ciclo de vida digital.
2.3 Pregunta de investigación
¿En qué medida una red blockchain permisionada (Hyperledger Fabric) integrada
con un sistema web permite verificar la integridad y trazabilidad de contratos
laborales electrónicos en el contexto normativo colombiano?
2.4 Justificación
Como se expuso en el planteamiento del problema, la creciente dependencia de
documentos digitales para formalizar relaciones laborales, gestionar acuerdos de
confidencialidad y conservar evidencia contractual ha puesto en evidencia la
necesidad de garantizar condiciones de integridad, trazabilidad y verificabilidad
sobre la información contenida en dichos archivos [1]. Las dificultades para verificar
si un documento ha sido modificado después de su emisión, especialmente cuando
se administra mediante repositorios convencionales sin mecanismos criptográficos
de validación [3,12], justifican la búsqueda de una solución técnica que aborde estas
carencias.
Al momento de tratar la problemática, se necesita sustentar tomando en cuenta el
marco normativo vigente de Colombia para documentos electrónicos. La Ley 527
de 1999 reconoce la validez jurídica y probatoria de los mensajes de datos, siempre
que sea posible demostrar la integridad de la información desde su creación [2].
Asimismo, el Decreto 2364 de 2012 regula la firma electrónica como un mecanismo
válido de autenticación en entornos digitales, mientras que la Ley 1581 de 2012
establece lineamientos para el tratamiento y la protección de los datos personales
[8]. Sin embargo, la falta de una adecuada gestión documental provoca que muchas
organizaciones no cuenten con los mecanismos necesarios para garantizar la
integridad, la trazabilidad y el control de modificaciones de los documentos
electrónicos [6,3]. Esto evidencia una brecha entre el reconocimiento normativo de
estos documentos y la capacidad técnica para verificar su autenticidad y
confiabilidad.
Ante este escenario, las tecnologías de registro distribuido surgen como una
alternativa para cerrar esa brecha [28]. Blockchain, la tecnología seleccionada,
permite mantener un registro cronológico, auditable e inmutable, a partir de
estructuras criptográficas enlazadas, logrando una ventaja mayor cuando se
requiere tener evidencia de integridad, trazabilidad y control de cambios [13,3]. En
particular, diversos estudios señalan que la aplicación de blockchain en sistemas
documentales fortalece la verificación de la integridad de los documentos, la
trazabilidad de los cambios realizados y los procesos de auditoría. Esto se debe a
que reduce la dependencia de mecanismos centralizados y aumenta la confiabilidad
de los registros almacenados [12, 20]. Por esta razón, su implementación en la

gestión documental no solo responde a una tendencia tecnológica, sino también a
la necesidad de garantizar mayor confianza, transparencia y seguridad en la
evidencia digital [15, 3].
Para el desarrollo de la solución se necesita seleccionar una alternativa tecnológica
pertinente dentro de blockchain que se ajuste a los requisitos del proyecto y que
permita garantizar un adecuado tratamiento de los documentos contractuales. Entre
las alternativas disponibles, Hyperledger Fabric resultó ser la opción más adecuada
para este proyecto, es una plataforma blockchain permisionada, modular y
orientada a entornos empresariales [25]. Cuenta con servicios como mecanismos
de control de acceso, confidencialidad y trazabilidad entre actores autorizados [22,
25]. Además, cuenta con una arquitectura que permite construir redes privadas bajo
control institucional, conservando propiedades de auditabilidad, trazabilidad e
inmutabilidad sin exponer información sensible en infraestructuras públicas [25, 21].
Su arquitectura distribuida y robusta evita que se desarrollen desde cero ciertos
mecanismos fundamentales como la gestión de identidades, el consenso, la
replicación del libro mayor y la validación de transacciones [21]. Esta red favorece
la viabilidad del proyecto y fortalece el control institucional sobre aspectos críticos
como el acceso, la identidad de los participantes y el registro de eventos [21].
En este sentido, usar Hyperledger Fabric permite concentrar el desarrollo en las
funcionalidades relacionadas con la verificación documental y la trazabilidad de
contratos, manteniendo un alto nivel de rigurosidad técnica [25]. El entorno será más
confiable debido al uso de estos mecanismos, y estará alineado con las
necesidades organizacionales [3,25].
Se propone el desarrollo de un MVP integrado a una red blockchain permisionada
para registrar, validar y consultar las acciones realizadas sobre documentos
contractuales. Cuando un documento sea cargado en la plataforma, se generará
una huella criptográfica única (hash) [5] la cual será registrada en la red blockchain
como evidencia de su estado e integridad. Cada cambio que se realice sobre el
documento generará una nueva huella criptográfica la cual quedará registrada,
permitiendo detectar cualquier alteración [6,12]. La solución no está en guardar los
documentos en sí, sino en conservar evidencia verificable de su estado a lo largo
del tiempo, sin comprometer la confidencialidad de su contenido [25, 12].
La idea de esta propuesta no es una herramienta tecnológica genérica, sino una
respuesta a una necesidad identificada en una empresa del sector de servicios
tecnológicos en Bogotá, donde se encontraron debilidades en la verificación de
integridad, el control de versiones y la capacidad probatoria de los contratos
manejados digitalmente [1, 18]. En este sentido, la solución se plantea para
responder directamente a un problema organizacional observado en un contexto
real de aplicación.

Desde el punto de vista técnico y operativo, la propuesta es factible en el contexto
de una investigación aplicada, ya que Hyperledger Fabric puede ser desplegado y
evaluado en entornos controlados mediante contenedores y redes de prueba, sin
necesidad de recurrir a la infraestructura empresarial de producción para validar su
funcionamiento [25]. Esto permite desarrollar una solución funcional, ejecutar
pruebas de integridad, trazabilidad y rendimiento, y demostrar la viabilidad técnica
del sistema en un entorno académico controlado [21].
Por último, desde el punto de vista organizacional, el desarrollo de un sistema web
para la verificación de integridad y trazabilidad documental en contratos laborales
representa una oportunidad concreta para que las organizaciones dejen de
depender de la buena fe o de revisiones manuales para confiar en sus propios
documentos. En un contexto donde los contratos laborales son la base de múltiples
decisiones jurídicas y operativas, contar con un mecanismo que permita demostrar
que un documento no fue alterado tiene un valor que va más allá de lo técnico [18,
2]. En Colombia, donde la transformación digital avanza más rápido que la
capacidad de muchas organizaciones para gestionarla con seguridad, propuestas
como esta aportan algo necesario: no solo tecnología, sino criterio sobre cómo
usarla [1, 3].
2.5 Antecedentes del proyecto
A nivel internacional, blockchain dejó de centrarse únicamente en criptomonedas,
permitiendo hoy en día diversos usos tales como rastrear, certificar y gestionar
información en organizaciones donde varias partes necesitan confiar entre sí sin
depender de un intermediario [3]. Hyperledger Fabric [25], por ejemplo, sienta las
bases técnicas para construir sistemas empresariales de gestión documental sobre
redes permisionadas, y es precisamente la tecnología para usar en el desarrollo del
proyecto. Por su parte, Rehan et al. [26] montaron una red con Fabric para rastrear
procesos en cadenas de suministro industriales usando contenedores y redes
virtualizadas, y aunque su caso era logístico, mostraron que Fabric funciona de
manera efectiva como infraestructura de trazabilidad distribuida.
En cuanto a la parte documental a nivel internacional, por ejemplo, Vaca y Dulce-
Villarreal [27] hicieron un mapeo sistemático sobre blockchain aplicada a la cadena
de custodia de evidencia digital forense, y concluyeron que blockchain sirve para
preservar la integridad y rastrear eventos sin que nadie pueda manipular los
registros. Un aspecto relevante es que la blockchain no se utiliza para almacenar
los documentos directamente, sino para registrar evidencia verificable de todo lo
que ocurre con un documento a lo largo de su ciclo de vida, guardando huellas
criptográficas y registros de eventos que permiten comprobar su autenticidad e
historial de cambios.
Najeeb et al. Evidenció algo similar en gobernanza electrónica, donde blockchain
protegió registros institucionales contra manipulaciones silenciosas [13]. De la

Fuente Martín [21] fue más allá y planteó que la trazabilidad documental con
blockchain debe pensarse como una secuencia de eventos verificables sobre el
documento, no como un simple registro de que existe, y esa idea fue de gran utilidad
para el diseño del flujo documental del presente proyecto. Sánchez Gómez [22]
reforzó este enfoque proponiendo que blockchain no debería ser un repositorio, sino
un mecanismo especializado de validación y control de consistencia. Y Mier Bello
et al. [12] lo llevaron a la práctica con un sistema de integridad de datos científicos
que logró detectar el 100% de las alteraciones controladas registrando huellas
criptográficas en el ledger, sin guardar los archivos originales en la cadena.
En Colombia, el MinTIC publicó una Guía de referencia para la adopción de
blockchain en el Estado [3], donde se establece que blockchain es una alternativa
viable para mejorar la transparencia, trazabilidad e integridad en la gestión de
información pública. Esto es importante porque muestra que a nivel institucional ya
hay interés real en estas tecnologías. En la práctica, Moscoso Urdaneta et al. [19]
desarrollaron un sistema de certificación digital de documentos académicos con
blockchain en Colombia, demostrando que se puede registrar evidencia verificable
de documentos digitales sin depender solo de repositorios tradicionales. Malagón
Caballero y Ramírez Franco [23] avanzaron aún más al construir un prototipo de
aplicación web para verificar la autenticidad de títulos académicos con blockchain,
combinando una interfaz web con una capa blockchain de validación.
En cuanto a la Universidad Católica de Colombia no se encontraron antecedentes
relacionados con blockchain para verificación de integridad documental en contratos
laborales. Pero en el ámbito universitario latinoamericano sí hay uno muy relevante;
Mauras Velez [24], en la Universidad Católica de Córdoba (Argentina), desarrolló un
verificador de integridad de documentos con blockchain para proteger la
autenticidad de actas de exámenes. Su sistema registra la huella criptográfica del
documento usando sellado de tiempo sobre la red Bitcoin con OpenTimestamps, y
permite verificar después que el archivo no fue modificado, todo sin guardar el
contenido en la cadena.
En resumen, todos estos antecedentes muestran que blockchain ha obtenido
buenos resultados tanto a nivel internacional como en Colombia para proteger la
integridad, trazabilidad y verificabilidad de la información. Pero también dejan claro
que hay un vacío, pues nadie ha desarrollado una solución enfocada
específicamente en verificar la integridad y trazabilidad de contratos laborales con
blockchain permisionada en el contexto colombiano.
2.6 Alcance y limitaciones
2.6.1 Alcances
El presente proyecto comprende el diseño, desarrollo y validación de un Producto
Mínimo Viable (MVP) de un sistema web integrado con una red blockchain

permisionada, orientado a la verificación de integridad y trazabilidad documental en
contratos laborales y acuerdos de confidencialidad (NDA) en formato PDF. El
proyecto se delimita al contexto de una empresa del sector de servicios tecnológicos
en Bogotá, seleccionada como caso de aplicación a partir de la identificación de
necesidades concretas en sus procesos de gestión contractual digital [14, 18].
Funcionalidad: El sistema tendrá definidos 3 roles de usuario: administrador del
sistema, empleado o la persona que firma el documento y el verificador, para el
desarrollo funcional se tendrá exclusivamente las siguientes acciones: autenticación
de usuarios de rol, carga de documentos contractuales en formato PDF, generación
y registro de huella criptográfica con el algoritmo SHA-256 [5], consulta de la
integridad del documento por medio de la comparación de hash y por último la
visualización del historial de trazabilidad de cada documento. El sistema no tendrá
funciones de edición del documento, firma electrónica avanzada, gestión
documental integral ni tendrá automatización del ciclo contractual completo.
Normativa: Para tener un enfoque más específico, el proyecto se centra en la
norma ISO/IEC 27001:2022, específicamente en el anexo A, el cual está
directamente relacionado con la integridad de la información y la criptografía,
específicamente en los controles A.8.24 y A8.11 los cuales hablan sobre el uso de
la criptografía y el enmascaramiento de datos respectivamente [10], los cuales
deben ser evaluados como criterios en el diseño arquitectónico de un sistema. El
proyecto no contempla la implementación ni certificación del Sistema de Gestión de
Seguridad de la Información (SGSI) completo definido por la norma, ni la realización
de auditorías de cumplimiento normativo.
Técnico: El sistema se desarrolla sobre un stack conformado por Node.js para el
backend y Go para el desarrollo del chaincode en Hyperledger Fabric. La red
blockchain permisionada se implementa con Hyperledger Fabric en configuración
mínima funcional, compuesta por una organización, un nodo par (peer), un nodo
ordenador (orderer) y un servicio de autoridad certificadora (CA), suficiente para
soportar el registro y consulta de huellas criptográficas y eventos de trazabilidad
[25]. Para la capa de lógica del sistema, se centrará en un único "chaincode"
modular que gestionará las operaciones de registro, verificación y consulta del
documento, esto en respuesta a la decisión de hacer un dominio único del sistema
y evitar complejidad en la arquitectura del proyecto. [27, 29].
Persistencia: Se tendrá un modelo híbrido compuesto por una base de datos
racional para la gestión de usuarios, metadatos de documentos y registros
operativos. A esto se complementa con la red blockchain permisionada como una
capa exclusiva para el registro inmutable de evidencia documental, los documentos
en PDF no se almacenan en cadena de bloques solo se registra la huella
criptográfica y las acciones necesarias para ejecutarlas dentro del sistema. [12, 27].
Despliegue: Será desplegado en una máquina virtual en Microsoft Azure durante

un período de prueba de un mes, utilizando Docker y Docker Compose como
mecanismo de contención y orquestación del entorno. Este despliegue tiene como
único propósito la validación técnica y funcional del MVP en un entorno controlado
y no corresponde a un despliegue productivo.
Validación: El proyecto contempla la ejecución de un Plan de Pruebas de Software
(PPS) formalmente estructurado, organizado en cuatro categorías: pruebas de
validación funcional mediante caja negra sobre los flujos principales del sistema;
pruebas de integridad y seguridad mediante mutación documental controlada
introduciendo modificaciones en contenido, texto, firmas y metadatos de PDFs ya
registrados para verificar la detección de alteraciones; pruebas de trazabilidad e
inmutabilidad para verificar que el historial recuperado desde el ledger coincida
cronológicamente con las acciones ejecutadas; y pruebas de rendimiento operativo
para medir latencias en escritura de hash y consulta de verificación. Las pruebas se
ejecutarán sobre un conjunto de 20 documentos sintéticos, compuesto por 12
contratos laborales y 8 acuerdos de confidencialidad, esto con el fin de simular
condiciones reales sin comprometer la información de la empresa.
Entregables: Se tendrán únicos entregables cómo: Documentación de
requerimientos funcionales, técnicos y normativos; diseño arquitectónico y funcional
del sistema web, la red blockchain permisionada en entorno de prueba; chaincode
desplegado y funcional; documento del plan de pruebas de software; informe de
resultados de pruebas y defectos; matriz de cumplimiento de requerimientos; y
manual de usuario y operación para despliegue en Docker.
2.6.2 Limitaciones
El proyecto no incluye su implementación en la infraestructura productiva de la
entidad que se está analizando ni su uso práctico durante la etapa de ejecución del
proyecto. La implementación en Azure tiene un tiempo determinado de un mes, una
vez finalicé este lapso, el entorno se cerrará sin continuidad en su operación.
Funcionalidad: Solo será posible manejar contratos laborales y acuerdos de
confidencialidad en formato PDF. No incluye otros tipos de documentos, formatos
de archivos diferentes (como DOCX, XML o imágenes), ni procesos documentales
que no estén relacionados con los contratos específicados. Además la cantidad de
documentos que se pueden gestionar durante la validación se limita a 20
documentos sintéticos y no se considera para uso masivo ni para una escala
empresarial.
Normativo: El proyecto referencia únicamente los controles A.8.24 y A.8.11 del
Anexo A de ISO/IEC 27001:2022 como criterios de diseño. No se implementa ni
evalúa el SGSI completo [10], no se realizan auditorías de cumplimiento normativo
y no se obtiene ningún tipo de certificación asociada a la norma.

Técnico: La red de blockchain se establece en una configuración básica de prueba
con una única organización y nodos simples. No incluye diseños de alta
disponibilidad, tolerancia a fallos distribuidos, configuración entre varias
organizaciones ni métodos avanzados de escalabilidad que son característicos de
entornos empresariales de producción [27, 29]. El chaincode desarrollado cubre
exclusivamente la lógica de registro y consulta documental definida en el alcance
funcional y no es extensible a otros dominios de negocio sin rediseño.
Seguridad: Se implementarán controles de seguridad a nivel arquitectónico y
funcional referenciados en el Anexo A de ISO/IEC 27001:2022, suficientes para
validar la confiabilidad del MVP en entorno controlado. No obstante, no se incluyen
controles avanzados orientados a producción tales como hardening de
infraestructura, gestión avanzada de secretos, monitoreo continuo de seguridad,
pruebas de penetración o esquemas de defensa en profundidad [10, 13].
Pruebas: El plan de pruebas de software se ejecuta en condiciones controladas
sobre el conjunto de documentos sintéticos definido. No contempla pruebas de
carga a escala empresarial, evaluación bajo escenarios de uso concurrente masivo.
Finalmente, los resultados obtenidos en la validación del MVP son válidos y
generalizables únicamente en el contexto del caso de aplicación analizado. El
sistema no ha sido diseñado ni evaluado para su implementación directa en otras
organizaciones sin un proceso previo de análisis de requerimientos, adaptación
arquitectónica y validación independiente

3. OBJETIVOS
3.1. Objetivo General
Desarrollar un MVP de un sistema web basado en blockchain permisionada para la
verificación de integridad y trazabilidad documental en contratos laborales.
3.2. Objetivos Específicos
Identificar, mediante análisis documental y consulta con actores clave, los
requerimientos funcionales, no funcionales y normativos necesarios para el
desarrollo del MVP de un sistema web y la implementación de una red blockchain
permisionada.
Diseñar la arquitectura del sistema contemplando el diseño UX/UI, la arquitectura
de software y la arquitectura de infraestructura sobre una red Hyperledger Fabric
desplegada en Docker.
Desarrollar el MVP del sistema web integrado con una red Hyperledger Fabric
desplegada en Docker, que permita el registro, verificación de integridad, consulta
y trazabilidad de contratos laborales entre personas y empresa mediante el
almacenamiento de hashes documentales en el ledger.
Evaluar el MVP mediante un plan de pruebas que verifique el comportamiento
funcional de los módulos, la detección de alteraciones en documentos registrados y
el rendimiento operativo del sistema.
3.3. Indicadores Clave de Desempeño (KPIs)
A continuación, se evidencian los KPIs utilizados para el proyecto, pero antes, para
tener un amplio conocimiento del contexto y de los términos utilizados en los KPIs,
se recomienda ver el Anexo A.
Tabla 1. Estructura general de los KPIs
Objetivo Específico KPI Meta / Valor esperado
Cobertura de
OE1:
≥ 90 % de los requerimientos
requerimientos
identificados formalizados al
documentados en el
Identificación
cierre de S4 (~36 de 40)
SRS
Cobertura de
90 % de las disposiciones de
disposiciones
de requerimientos Ley 527/1999, D.2364/2012 y
normativas
Ley 1581/2012 (~15 artículos)
mapeadas al SRS
OE2: Artefactos de diseño 4 de 4 dominios aprobados

|     |     |     |     |
| --- | --- | --- | --- |

|     | aprobados por el  | antes del inicio del desarrollo  |     |
| --- | ----------------- | -------------------------------- | --- |
Diseño de la
|     | tutor  | (S7)  |     |
| --- | ------ | ----- | --- |
Tasa de
≤ 10 % de observaciones
observaciones
| arquitectura  |     | críticas por sesión de revisión  |     |
| ------------- | --- | -------------------------------- | --- |
críticas en revisión
(máx. 2 de ~20 componentes)
de diseño
| OE3:  | Percentil 95 (P95) de  | P95 ≤ 3.000 ms en 50           |     |
| ----- | ---------------------- | ------------------------------ | --- |
|       | latencia del endpoint  | peticiones consecutivas sobre  |     |
Desarrollo
|     | de verificación  | Docker local (S11 y S13)  |     |
| --- | ---------------- | ------------------------- | --- |
≥ 80 % de las HU
Porcentaje de
comprometidas aprobadas al
| del MVP  | historias de usuario  |     |     |
| -------- | --------------------- | --- | --- |
cierre de cada sprint (~4 de 5
aprobadas por sprint
HU)
|       | Tasa de detección  | 100 % de los 20 documentos    |     |
| ----- | ------------------ | ----------------------------- | --- |
| OE4:  | de alteraciones    | alterados detectados como no  |     |
|       | documentales       | íntegros                      |     |
Porcentaje de casos
≥ 90 % de casos PASS en la
de prueba
| Evaluación  |     | suite final (~45 de 50 casos, 5  |     |
| ----------- | --- | -------------------------------- | --- |
funcionales con
módulos × 10 casos)
resultado PASS
Porcentaje de
≥ 85 % de actividades del PPS
ejecución del Plan
| del MVP  |     | cerradas al cierre de S15 (~17  |     |
| -------- | --- | ------------------------------- | --- |
de Pruebas (PPS)
de 20 actividades)
completado en plazo
Fuente: Elaborado por las autoras a partir de [33]

4. MARCOS DE REFERENCIA
4.1. Marco conceptual
Para comprender el funcionamiento del sistema propuesto, es necesario definir una
serie de conceptos que sustentan tanto su operación técnica como su propósito
documental. Estos conceptos están relacionados entre sí y permiten entender cómo
una aplicación web puede garantizar la integridad y la trazabilidad de contratos
laborales digitales mediante tecnología blockchain, así como la relevancia jurídica
que este enfoque tiene en el contexto colombiano.
El primer concepto fundamental es la integridad documental, entendida como la
capacidad de demostrar que un documento conserva exactamente el mismo
contenido con el que fue creado o registrado, sin modificaciones no autorizadas.
En el ámbito digital no se puede garantizar que un documento sigue siendo original
solamente porque al observarlo se ve auténtico, pues para el ámbito jurídico esto
no es una evidencia clara, por lo que se necesita contar con mecanismos confiables
que brinden pruebas de que la información no se alteró y es legítima [16, 18]. Para
los contratos laborales esta situación cobra relevancia ya que cualquier modificación
en algún dato sensible puede generar conflictos o disputas legales [19].
La integridad del documento es un factor esencial; sin embargo, también se necesita
poder demostrar cuándo fue registrado originalmente y conocer si hubo algún
cambio sobre él, identificando que ocurrió, cuando ocurrió y quien realizo la acción.
Este proceso se conoce como trazabilidad documental, haciendo referencia a la
capacidad de reconstruir de forma verificable el historial de un documento a lo largo
de todo su ciclo de vida [20, 21]. En consecuencia, un sistema que preserve tanto
la integridad como la trazabilidad no solo protege la información, sino que mantiene
un registro auditable de los eventos [22].
La verificación de la integridad se apoya en el uso de funciones hash criptográficas,
que transforman información de cualquier tamaño en una huella única de longitud
fija [5]. Esta huella actúa como una representación única del contenido: mientras el
archivo permanezca intacto, el hash será el mismo; cualquier modificación producirá
un resultado diferente, haciendo evidente la alteración [16, 23]. Esta huella actúa
como una representación única del contenido: mientras el archivo permanezca
intacto, el hash será el mismo; cualquier modificación producirá un resultado
diferente, haciendo evidente la alteración [5] y ampliamente utilizado en soluciones
de gestión documental basadas en blockchain [24, 19].
La plataforma seleccionada es Hyperledger Fabric, cuya arquitectura modular
separa los procesos de ejecución, ordenamiento y validación para ofrecer un
desempeño eficiente en entornos empresariales [25]. Dentro de esta infraestructura,
el chaincode ejecuta las reglas de negocio sobre el ledger, el cual funciona tendrá
el registro permanente de todas las operaciones, almacenando únicamente las

huellas criptográficas y eventos verificables para proteger información sensible.
Estos registros no se pueden modificar fácilmente ya que cada operación recibirá
un identificador único (txID) que se encargará de mantener un rastreo. Además, las
identidades de los usuarios son gestionadas por el Membership Service Provider
(MSP), el componente encargado de verificar quiénes pueden acceder a la red y
qué acciones tienen permiso para realizar [26].
Como conclusión, los elementos anteriormente mencionados son fundamentales
para fortalecer el valor probatorio documental dentro del marco jurídico colombiano.
Al aplicar estos aspectos se puede demostrar evidencia verificable, la autenticidad,
la integridad y trazabilidad de la información registrada [2]. En este contexto, la firma
electrónica permite saber quién realizó una acción o firmó un documento [9],
mientras que el registro inmutable ayuda a demostrar que la información no ha sido
modificada con el tiempo, demostrando que es transparente y confiable [42].
4.2. Marco teórico
4.2.1. Verificación de integridad documental mediante criptografía
El problema de demostrar que un documento no ha sido alterado desde su creación
se viene abordando desde la criptografía aplicada. En 1991, Haber y Stornetta
propusieron un mecanismo basado en sellos de tiempo y encadenamiento de
resúmenes criptográficos que partía de la siguiente idea: la prueba de integridad no
puede depender del propio documento ni del sistema que lo almacena, sino de un
registro externo verificable de forma independiente [4]. Esa idea, que en su
momento era teórica, terminó convirtiéndose en el fundamento de los sistemas de
registro inmutable que hoy se conocen [4].
La verificación de la integridad de un documento puede realizarse mediante
funciones hash criptográficas, las cuales generan una huella digital única para cada
archivo. Esta huella siempre será la misma mientras el contenido permanezca sin
cambios. Sin embargo, si el documento es modificado, incluso de manera mínima,
la huella generada será completamente diferente. Gracias a esta característica es
posible detectar alteraciones de forma rápida y automática [5, 7].
Las funciones hash poseen características que las hacen útiles para verificar la
integridad de los documentos, entre ellas el determinismo, la resistencia a colisiones
y el efecto avalancha [6]. Para el sistema propuesto, la propiedad más relevante es
el efecto avalancha, ya que permite detectar automáticamente cualquier
modificación realizada en el documento, incluso si se trata de un cambio mínimo
[12].
Para generar esas huellas, el proyecto utiliza SHA-256, algoritmo estandarizado por
el NIST dentro de la familia SHA-2 [5]. Se eligió por dos razones prácticas: es el

algoritmo de hash que Hyperledger Fabric emplea internamente en su cadena de
bloques, lo cual evita inconsistencias entre la huella calculada por la aplicación y la
que registra la red [19]. A la fecha no se conocen ataques que comprometan su
resistencia a colisiones, lo que lo mantiene como una opción segura para este tipo
de aplicaciones [5].
Ahora bien, también importa poder demostrar cuándo se registró, por lo que el
protocolo RFC 3161 resuelve eso al definir cómo asociar una marca temporal a un
dato de forma criptográficamente verificable [6]. Con este mecanismo, la evidencia
no solo prueba que el contenido permanece intacto, sino que ancla ese estado a un
momento específico en el tiempo [4, 6]. Para efectos del sistema, esa marca
temporal es lo que permite a un tercero confirmar que el documento ya existía en
determinada fecha y que desde entonces no ha sido modificado [6].
La combinación de las funciones hash y las marcas de tiempo permite generar
evidencia confiable sobre los documentos digitales [4, 6]. Mientras que las huellas
digitales ayudan a verificar que el contenido no ha sido modificado, las marcas de
tiempo permiten demostrar cuándo fue registrado. De esta manera, es posible
garantizar la integridad, autenticidad y trazabilidad de los documentos [10].
4.2.2. Blockchain permisionada como infraestructura de registro
inmutable
En su forma más básica, una blockchain es un registro distribuido donde la
información se agrupa en bloques y cada bloque incluye el hash del bloque anterior
formando una cadena. Esa estructura tiene una consecuencia práctica directa, pues
si alguien modifica un registro antiguo los hashes de todos los bloques posteriores
dejan de coincidir y la alteración queda expuesta de forma matemática [20, 21]. La
tecnología nació en redes públicas abiertas, pero con el tiempo aparecieron
variantes pensadas para organizaciones que necesitan más control sobre quién
participa y qué información se comparte [22].
Esas variantes son las blockchains permisionadas. A diferencia de una red pública,
donde cualquier persona puede unirse y ver todo, en una permisionada solo
participan los que han sido identificados y autorizados previamente por una entidad
administradora [22]. Eso es lo que las hace viables para manejar información
contractual sensible: se conserva la inmutabilidad del registro, pero sin exponer
documentos privados a quienes no deberían verlos [23].
En el ámbito de la gestión documental y legal, estas redes aportan registros que no
se pueden modificar una vez escritos, un historial transparente de todo lo que
ocurrió y la posibilidad de que varios participantes autorizados verifiquen la
información por su cuenta [24, 25]. Díaz Michel y Llamas Covarrubias [15] declaran
que blockchain no sirve para reemplazar la redacción legal de un contrato; su valor
real está en generar evidencia técnica de que ese contrato existe y no ha sido

alterado.
Esa distinción es la que define el alcance de este proyecto. No se busca reemplazar
el contrato laboral como instrumento jurídico ni crear documentos con autonomía
legal propia. Lo que se hace es usar blockchain como una capa de confianza
adicional que genera evidencia verificable sobre contratos que ya existen,
reforzando así las garantías de integridad y trazabilidad en la relación laboral entre
personas y empresas [20, 23].
4.2.3. Hyperledger Fabric como plataforma de implementación
Hyperledger Fabric es una plataforma blockchain de código abierto, mantenida por
la Hyperledger Foundation bajo la Linux Foundation, y diseñada específicamente
para redes permisionadas en entornos empresariales [25]. Lo que la diferencia de
otras plataformas es su modelo de procesamiento de transacciones, llamado
execute-order-validate. Inicialmente los peers ejecutan la transacción, luego un
servicio de ordenamiento la agrupa con otras en un bloque, y finalmente se valida
antes de escribirla en el ledger [25].
La arquitectura de la red está formada por varios componentes que trabajan juntos.
Los peers almacenan una copia de la información registrada y ejecutan las reglas
del sistema. El servicio de ordenamiento se encarga de organizar las transacciones
y agruparlas antes de agregarlas a la cadena de bloques. Por su parte, el MSP
administra la identidad de los usuarios y controla los permisos de acceso dentro de
la red [25]. Además, existen los canales, que permiten que cierta información solo
sea visible para grupos específicos de participantes, protegiendo así los datos
sensibles.
Para que una aplicación pueda interactuar con la red blockchain, se utiliza el Fabric
SDK. Este componente permite enviar transacciones, consultar información
almacenada y gestionar identidades sin que el desarrollador tenga que trabajar
directamente con los elementos internos de la red. En la práctica funciona como un
intermediario entre la aplicación y la blockchain.
Que todo esto funcione fuera del laboratorio ya se ha probado. Rehan et al. [26]
documentaron una implementación con contenedores Docker y CouchDB como
base de datos de estado, y mostraron que esa combinación permite hacer consultas
avanzadas sobre los datos almacenados y mantener comunicaciones seguras entre
nodos. El presente proyecto adopta una arquitectura similar, lo que hace de ese
estudio un referente directo.
El uso de Docker permite que todos los componentes de la red blockchain se
ejecuten en entornos aislados. Gracias a ello, la solución puede replicarse
fácilmente en distintas máquinas y resulta más sencilla de administrar, ya que los
problemas en un componente no afectan directamente a los demás [26]. Para un

proyecto académico, esto facilita las pruebas y el desarrollo en diferentes equipos.
4.2.4. Chaincode y automatización de lógica documental
Chaincode es el programa que contiene las reglas de negocio dentro de
Hyperledger Fabric. Se instala en los peers de la red y define qué operaciones se
pueden hacer sobre los datos del ledger y en qué condiciones [25]. Como todos los
peers ejecutan el mismo código las reglas se aplican de manera uniforme sin
importar cuál nodo procese la transacción.
En blockchain, el chaincode o contrato inteligente es un programa que ejecuta
automáticamente determinadas acciones cuando se cumplen ciertas condiciones.
Además de automatizar procesos, registra cada acción realizada, lo que permite
conocer qué ocurrió y en qué momento sucedió [11].
En este proyecto el chaincode no almacena contratos laborales completos, lo que
guarda son las huellas criptográficas de esos documentos y los eventos asociados
a su ciclo de vida; registro inicial, verificaciones posteriores, y consultas. Cada una
de esas acciones genera una transacción con un identificador único (txID), lo cual
permite reconstruir con precisión qué se hizo, cuándo y en qué orden [25].
Mier Bello et al. [12] probó esta idea en un sistema de integridad de datos científicos
sobre Hyperledger Fabric y concluyeron que usar blockchain como capa de
evidencia criptográfica en vez de como repositorio de archivos, permite detectar
alteraciones sin necesidad de guardar los documentos originales en la cadena. En
sus pruebas obtuvieron una tasa de detección del 100 % frente a modificaciones
controladas, lo que respalda la viabilidad del modelo que adopta este proyecto.
Según Bannikov et al. [30], la automatización basada en blockchain es más efectiva
cuando las reglas pueden ser supervisadas y verificadas por varios participantes.
En este sistema, esa función la cumple el chaincode, ya que se encarga de ejecutar
automáticamente las reglas de registro y verificación, asegurando que siempre se
apliquen de la misma forma sin importar quién realice la operación [30].
4.2.5. Patrones de diseño en sistemas documentales con blockchain
No todos los sistemas documentales con blockchain se diseñan igual, pero la
literatura muestra un patrón que se repite en las soluciones mejor logradas. Precht,
Hüllmann y Marx Gómez [20], a partir de una revisión sistemática, identifican tres
capas que suelen estar presentes. La primera son los documentos originales, que
se guardan fuera de la blockchain en repositorios convencionales. La segunda son
los metadatos y la información operativa, que normalmente viven en una base de
datos relacional. Y la tercera son las pruebas criptográficas de integridad, que son
las únicas que se registran en la blockchain [20].
Esta estrategia permite aprovechar los beneficios de la blockchain sin almacenar

directamente los documentos en la red. Los contratos permanecen en un
almacenamiento externo, mientras que en la blockchain solo se registra su huella
digital. De esta manera, es posible verificar la integridad del documento sin afectar
el rendimiento de la red ni exponer información sensible.
Siguiendo una arquitectura utilizada en diversos proyectos blockchain, el sistema
incorpora un backend que actúa como intermediario entre la interfaz de usuario y la
red Hyperledger Fabric. Este componente se encarga de la autenticación, el control
de acceso y la validación de las operaciones, evitando que el frontend interactúe
directamente con la infraestructura blockchain [20].
En materia de seguridad, el diseño del sistema se basa en buenas prácticas
inspiradas en la norma ISO/IEC 27001:2022 [10]. Aunque el proyecto no implementa
un sistema de gestión de seguridad completo ni busca una certificación, sí adopta
controles relacionados con la gestión de accesos, el registro de actividades, la
protección de la integridad de los datos y la reducción de la exposición de
información sensible.
La incorporación de estas prácticas permite fortalecer la seguridad del prototipo y
justificar que las decisiones de diseño adoptadas están alineadas con estándares
reconocidos internacionalmente [10].
4.2.6. Plan de pruebas y evaluación del sistema
Para verificar el correcto funcionamiento del sistema, se definió una estrategia de
pruebas enfocada en los aspectos más importantes de la solución [31]. Estas
pruebas incluyen la validación del registro de documentos, la generación de huellas
criptográficas y la consulta de la información almacenada. También se realizan
pruebas de integridad, modificando deliberadamente documentos previamente
registrados para comprobar que el sistema detecta cualquier alteración.
Adicionalmente, se evalúa la comunicación entre la interfaz web, el backend y la red
Hyperledger Fabric para asegurar que todos los componentes funcionen de manera
integrada. Los casos de prueba más críticos se automatizan para poder ejecutarlos
repetidamente y garantizar la confiabilidad del sistema ante futuras modificaciones
[31].
Además de evaluar las funcionalidades del sistema, también es necesario medir el
desempeño de la red blockchain. Para ello, se consideran indicadores como la
cantidad de transacciones que la red puede procesar, el tiempo que tarda en
registrar una transacción y la consistencia de la información almacenada entre los
distintos nodos [32]. Estos indicadores se complementan con métricas del sistema,
como la capacidad para detectar alteraciones en los documentos, el tiempo de
respuesta de las operaciones y la disponibilidad del historial de trazabilidad. En
conjunto, estas medidas permiten determinar de forma objetiva si la solución cumple
con los objetivos planteados para el MVP [32].

4.3. Marco jurídico
Al ser un proyecto que maneja documentos digitales sensibles, se deben cumplir
las normas que regulan la seguridad y protección de los datos personales, para ello
se tomarán tantos los estándares internacionales como los nacionales.
4.3.1. Estándares internacionales
A nivel nacional, la norma principal para estos casos es la ISO/IEC 27001:2002 la
cual define como se debe gestionar la seguridad de la información [10]. Aunque el
proyecto no está centrado en todo el estándar, si toma principios como guía de
diseño para: acceso de usuarios, separación de responsabilidades, protección de
los contratos con su hash, y entre otros.
El enfoque principal que toma el proyecto sobre la norma ISO/IEC 27001:2002, es
el Anexo A, el cual contiene un conjunto de controles de seguridad conocidos
mundialmente para los accesos, cifrados, auditorias y manejo de incidentes [10] los
cuales son primordiales al implementar herramientas propias del Hyperledger
Fabric. En los alcances y limitaciones del proyecto se habla más a profundidad
sobre el anexo.
Por último, también es importante incluir la norma ISO 15489-1:2016, orientada a la
gestión de documentos y registros, establece que los sistemas documentales deben
garantizar cuatro propiedades fundamentales: autenticidad, integridad, fiabilidad y
disponibilidad [45].
4.3.2. Marco normativo colombiano
Pasando ahora a nivel nacional, la principal norma colombiana que sustenta el
proyecto es la Ley 527 de 1999, considerada un pilar importante para el derecho
informático del país, ya que establece el marco jurídico para los mensajes de datos,
el comercio electrónico y las firmas digitales [2]. Esta ley incorpora el principio de
equivalencia funcional, según el cual los documentos electrónicos pueden producir
los mismos efectos jurídicos que los documentos físicos, siempre que se garantice
su confiabilidad e integridad. En particular, los artículos 6 al 12 tienen una relación
directa con el sistema propuesto, pues establecen que un mensaje de datos cumple
con el requisito de constar por escrito cuando la información puede ser consultada
posteriormente, y que su integridad debe evaluarse verificando que la información
haya permanecido completa e inalterada, independientemente de los cambios de
formato derivados de su transmisión, almacenamiento o presentación. En este
sentido, el sistema satisface dicho requisito mediante el registro de la huella
criptográfica SHA-256 en el ledger de Hyperledger Fabric, ya que cualquier
modificación realizada sobre el documento genera un hash diferente, permitiendo
detectar alteraciones y comprobar la integridad del contenido original en cualquier
momento.

Por otro lado, el Decreto 2364 de 2012 reglamenta el artículo 7 de la Ley 527 de
1999 en lo referente a la firma electrónica, reconociendo la validez de distintos
mecanismos tecnológicos para identificar a una persona y asociarla con una
manifestación de voluntad sobre un documento digital [9]. El sistema desarrollado
no pretende sustituir estos mecanismos de firma, sino complementarlos. En este
contexto, el control de identidades proporcionado por el Membership Service
Provider (MSP) de Hyperledger Fabric permite autenticar a los usuarios que realizan
operaciones sobre el ledger, siguiendo principios similares a los establecidos por la
norma para la atribución verificable de actuaciones electrónicas. Como resultado,
es posible determinar de manera confiable quién ejecutó cada acción registrada
dentro del historial de trazabilidad documental.
Para la protección de datos personales, Colombia cuenta con la Ley 1581 de 2012
[8]. Los contratos laborales contienen información sensible de los trabajadores,
como nombres, números de identificación, salarios o cargos, cuyo tratamiento debe
ajustarse a principios como la finalidad, la necesidad y la minimización de datos.
Para responder a estas exigencias normativas, el sistema evita almacenar el
contenido de los contratos tanto en la base de datos relacional como en la red
blockchain. En su lugar, únicamente registra la huella criptográfica SHA-256 de cada
documento, permitiendo verificar su integridad sin exponer ni procesar directamente
los datos personales contenidos en él.
Para terminar con la parte normativa, se toma en cuenta la guía de referencia para
la adopción e implementación de proyectos con tecnología blockchain para el
Estado colombiano elaborada por el MinTIC [3]. Esta guía destaca el potencial de
las plataformas blockchain permisionadas para garantizar la integridad, trazabilidad
y transparencia de los registros en entornos institucionales, promoviendo su
adopción en escenarios donde la inmutabilidad de la información y el control de
acceso son requisitos esenciales. Estas características coinciden directamente con
los objetivos del sistema propuesto. Aunque la guía está orientada principalmente a
entidades del sector público, los criterios técnicos y las recomendaciones que
plantea también resultan aplicables a organizaciones privadas interesadas en
implementar soluciones basadas en blockchain dentro del contexto colombiano.

5. ESTADO DEL ARTE
Con la digitalización de los procesos en las organizaciones, los documentos
electrónicos se han vuelto parte central de actividades clave como la contratación,
la gestión de evidencias y el control documental. Si bien esto ha hecho más ágil el
trabajo, también ha traído riesgos nuevos relacionados con la integridad, la
autenticidad y la trazabilidad de la información [1]. En Colombia el tema toma fuerza
por el crecimiento constante del sector TI y por el aumento de los procesos
contractuales que hoy se manejan en formato digital, lo que deja a las
organizaciones más expuestas a alteraciones documentales y a problemas para
sostener la validez probatoria de sus contratos digitales [2]. Uno de los
inconvenientes que más se repite es la dificultad para asegurar que un documento
electrónico se conserve tal cual fue emitido cuando se almacena o se intercambia
en repositorios tradicionales que no incluyen mecanismos criptográficos de
verificación [3].
Viendo el lado técnico de la integridad de los documentos digitales, su base consta
de las funciones del hash y los sellos de tiempo. Para comprender mejor este
término, el trabajo de Haber y Stornetta [4] estableció las bases de los registros
inmutables mediante encadenamiento de pruebas verificables, por otro lado,
tenemos el estándar NIST FIPS 202 [5] el cual afianzó el uso de SHA-3 para la
verificación de la información digital, así como el protocolo RFC 3161 [6] fue el que
concretó el uso del sellado de tiempo como evidencia temporal confiable.
A lo anterior hay que sumarle que el blockchain ha sido una tecnología estudiada
que puede fortalecer la integridad, trazabilidad, auditoría documental, etc, en el
entorno digital. Por ejemplo, el trabajo de Casino, Dasaklis y patsakis [28], afirmó
que es posible implementar blockchain en sectores de salud, finanza y
administración pública gracias a la inmutabilidad de los registros y su
descentralización. Por el otro lado de la moneda tenemos a Pretch, hüllmann y Marx
Gómez [20] los cuales señalan que gran parte de las investigaciones se concentran
en certificaciones académicas y credenciales, eso indica que sectores como la
documentación de contratos laborales aún es un campo que no se ha explorado
como se debería.
Aunque es un sector poco explorado, hay académicos que han intentado indagar
por ese lado. Zheng y Zibing [11] resaltan que los contratos inteligentes ayudan a
automatizar procesos y aumentar la trasparencia, aunque también tienen sus
desafíos cómo la gobernanza y la seguridad de los datos. Por eso es importante
hablar del trabajo de Diaz Michel y llamas Covarrubias [15] el cual trata sobre como
el blockchain puede afrontar estos desafíos al fortalecer la evidencia, integridad y
trazabilidad de los documentos digitales.
Para comprobar estas afirmaciones, se hacer un valor probatorio de los documentos

digitales, los cuales, según Acosta León [16], solo pueden sostenerse jurídicamente
cuando existen mecanismos tecnológicos que puedan verificar la autenticidad,
integridad y trazabilidad de forma objetiva. Por ejemplo, Mendoza Ingrid [17] afirma
que los sistemas de documentación no solo deben de almacenar la información y el
registro, también deben ser capaces de tener un registro verificable de las acciones
realizadas sobre cada documento, y de ser necesario, reconstruir los eventos
ocurridos en el documento.
Pasando a la infraestructura, las redes blockchain permisionadas son la opción más
conveniente para escenarios empresariales en los que se necesita control de
acceso, confidencialidad y gobernanza institucional. Androulaki et al. [25] presentan
Hyperledger Fabric como una arquitectura distribuida pensada para redes
permisionadas y destacan su modelo execute-order-validate, que permite alcanzar
un buen rendimiento con baja latencia, así como su diseño modular en los
componentes de identidad (MSP), ordenamiento y chaincode. Rehan et al. [26]
ponen a prueba a Fabric en un escenario empresarial real de trazabilidad con
múltiples actores y muestran que permite registrar flujos de eventos verificables
entre varios participantes y mantener un historial auditable, lo que lo hace
especialmente adecuado para la gestión documental entre organizaciones. Frente
a alternativas como las redes públicas orientadas a entornos EVM.
Para tener una idea más clara de la implementación de blockchain a nivel nacional,
Malagón Caballero y Ramírez Franco [23] propusieron un prototipo de aplicación
web para verificar la autenticidad de títulos académicos mediante blockchain,
dejando ver que es técnicamente viable integrar una interfaz web con una red
blockchain para consultar y validar documentos digitales. Estas experiencias
confirman que combinar sistemas web con redes blockchain permisionadas es un
enfoque viable para la verificación documental, aunque su aplicación específica en
contratos laborales sigue sin explorarse.
A partir de esta revisión, se identifican tres brechas principales en el estado actual
del conocimiento. La primera es la escasa aplicación de blockchain a la verificación
de integridad documental en contratos laborales, ya que la mayoría de la literatura
se centra en certificados académicos, trazabilidad institucional o contratos
inteligentes [28], [29]. La segunda tiene que ver con la poca conexión entre los
mecanismos técnicos de verificación y las exigencias normativas sobre valor
probatorio e integridad documental en contextos jurídicos como el colombiano; de
hecho, ninguno de los trabajos revisados toma de forma explícita el cumplimiento
del marco normativo vigente como criterio de diseño técnico para este tipo de
sistemas [15], [16]. La tercera es la falta de propuestas pensadas para entornos
empresariales colombianos que reúnan, en una misma solución, verificación de
integridad, trazabilidad documental y control institucional sobre una infraestructura
blockchain permisionada [20], [23].

6. METODOLOGÍA
La estrategia metodológica de este proyecto se define bajo un enfoque mixto,
integrando la investigación aplicada para la fundamentación técnica-normativa y un
ciclo de vida de software para la construcción del MVP. Esta combinación garantiza
que el desarrollo técnico no solo sea funcional, sino que esté rigurosamente
alineado con el marco legal colombiano y las necesidades de integridad documental.
Figura 1. Metodología Ciclo de Vida Prototipado
Fuente: Tomado de [43]
6.1. Diseño de la Investigación
Se adopta una investigación aplicada con alcance descriptivo y enfoque cualitativo.
Investigación Aplicada: Busca utilizar el conocimiento tecnológico de blockchain
para resolver el problema específico de la alteración de contratos laborales [18],
[22].
Alcance Descriptivo: Permite caracterizar las propiedades de integridad y
trazabilidad requeridas, detallando cómo la arquitectura de Hyperledger Fabric
satisface estas necesidades [2], [11].
6.2. Ciclo de Vida del Software (SDLC): Prototipado Evolutivo
Dado que el equipo está conformado por dos personas, se ha seleccionado el
modelo de Prototipado Evolutivo, este modelo permite:
Reducción de riesgos: Validar la conexión con la red blockchain (la parte más

compleja) de forma temprana.
Refinamiento continuo: Ajustar la interfaz de usuario (UX/UI) y la lógica del
chaincode conforme se estabiliza la integración.
Esta metodología es perfecta para el enfoque del MVP ya que Prioriza las
funcionalidades críticas (registro de hash y consulta de integridad) para asegurar un
producto funcional.
Figura 2. Proceso de Metodología del proyecto
Fuente: Creado por las autoras
6.3. Fases del Proyecto y Correspondencia con Objetivos
A continuación, se detallan las fases metodológicas, las actividades clave y los
entregables, vinculándolos directamente con los Objetivos Específicos (OE).
Fase 1. Análisis, Benchmarking y Definición de Requerimientos (Relacionado
con OE1)
En esta fase se recolecta la información base para la viabilidad del sistema.
Procedimiento:
Análisis Normativo: Revisión cualitativa de la Ley 527 de 1999 y Ley 1581 de 2012
y los controles de integridad de la información y requisitos de criptografía
establecidos en el Anexo A de la norma ISO/IEC 27001:2022. para definir los
criterios de integridad y privacidad (no almacenamiento de datos sensibles en el
ledger).

Benchmarking Metodológico: Se realiza un análisis comparativo entre la solución
propuesta (Hyperledger Fabric + Docker) frente a soluciones comerciales (ej.
Google Cloud Platform). Se evalúan criterios como costo, inmutabilidad
criptográfica, control de datos y valor jurídico en Colombia.
Revisar Anexo C.
Levantamiento de Requerimientos: Traducción de necesidades en historias de
usuario priorizadas.
Entregables: Matriz de trazabilidad normativa, Cuadro comparativo de
benchmarking y Backlog del MVP.
Revisar anexo A para el backlog.
Fase 2. Diseño de Arquitectura y Modelado del Sistema (Relacionado con OE2)
Traducción de los requerimientos a especificaciones técnicas detalladas.
Procedimiento:
Diseño de Arquitectura: Definición de la estructura de capas (Presentación,
Aplicación, Blockchain y Persistencia).
Modelado de Red Blockchain: Configuración de la topología de Hyperledger
Fabric (Organizaciones, Peers, Orderers y Canales) en entornos Docker.
Diseño UX/UI: Creación de prototipos de baja y alta fidelidad enfocados en la
simplicidad de la verificación documental.
Entregables: Diagramas UML (Componentes, Secuencia y Despliegue), Diseños
de interfaz y Especificación técnica del chaincode.
Fase 3. Desarrollo e Integración del MVP (Relacionado con OE3)
Construcción del sistema siguiendo el enfoque de prototipado evolutivo.
Procedimiento:
Configuración de Infraestructura: Despliegue de la red permisionada mediante
Docker Compose.
Lógica de Negocio (Chaincode): Desarrollo de las funciones en Node.js/Go para
el registro y consulta de hashes SHA-256.
Desarrollo Frontend y Backend: Construcción de la aplicación web e integración
con el Fabric SDK para comunicar la interfaz con la red blockchain.

Entregables: Código fuente del MVP, Script de despliegue de la red y API de
integración funcional.
Fase 4. Evaluación, Pruebas de Integridad y Rendimiento (Relacionado con
OE4)
Esta fase tiene como objetivo validar la calidad, seguridad y eficiencia del MVP. No
se limita a la ejecución aleatoria de tareas, sino que se rige por un Plan de Pruebas
de Software (PPS) formalmente estructurado, que garantiza que cada requerimiento
definido en la Fase 1 sea verificado.
Procedimiento:
Diseño del Plan de Pruebas: Se definen los casos de prueba, los datos de entrada,
los resultados esperados y los criterios de aceptación para cada módulo.
Pruebas de comportamiento funcional (Caja Negra): Validación de que cada
función del sistema web (carga, registro, consulta) se ejecute según lo definido en
las historias de usuario. Se verifica que el flujo entre el usuario, la API y el SDK de
Hyperledger Fabric sea consistente.
Pruebas de Integridad y Seguridad (Mutación Documental): Ejecución de
pruebas de estrés sobre la integridad de los datos. Se introducen modificaciones
intencionadas en archivos PDF ya registrados (cambios en el texto, firmas o
metadatos) para confirmar que el sistema detecte la modificación al comparar el
hash generado contra el hash almacenado en el ledger.
Pruebas de Trazabilidad e Inmutabilidad: Verificación técnica de que el historial
de transacciones recuperado desde la blockchain coincida cronológicamente con
las acciones realizadas sobre el documento, asegurando la propiedad de no-
repudio.
Pruebas de Rendimiento Operativo: Medición sistemática de latencias (tiempos
de respuesta) en dos momentos críticos: la escritura del hash en la red
permisionada y la consulta de verificación por parte del usuario final.
Entregables:
Documento del Plan de Pruebas de Software: Especificación de entornos,
herramientas y casos de prueba.
Informe de Resultados de Pruebas y Defectos: Resumen de éxitos, fallas
encontradas y acciones correctivas tomadas.
Matriz de Cumplimiento de Requerimientos: Documento que cruza los
requerimientos iniciales (Fase 1) con los resultados de las pruebas, demostrando la

|     |     |     |     |
| --- | --- | --- | --- |

cobertura total del proyecto.
Manual de Usuario y Operación: Guía técnica para el despliegue en Docker y uso
del sistema.
6.4. Instrumentos y Herramientas
Para garantizar el rigor del proyecto, se utilizarán los siguientes instrumentos:
Tabla 2. Instrumentos y Herramientas

Herramienta / Tecnología /
Categoría
Instrumento
| Frontend                 | React (v18+)             |                    |     |
| ------------------------ | ------------------------ | ------------------ | --- |
| Backend                  | Node.js con Express      |                    |     |
| Autenticación            | JSON Web Tokens (JWT)    |                    |     |
| Blockchain               | Hyperledger Fabric v2.5  |                    |     |
| Blockchain               | Go (Golang)              |                    |     |
| Persistencia             | MongoDB                  |                    |     |
| Infraestructura          | Docker y Docker Compose  |                    |     |
| Diseño UX/UI             | Figma                    |                    |     |
| Desarrollo               | Visual Studio Code       |                    |     |
| Control de versiones     | GitHub                   |                    |     |
| Pruebas de API           | Postman                  |                    |     |
| Gestión de contenedores  | Docker Desktop           |                    |     |
| Administración BD        | MongoDB Compass          |                    |     |
| Modelado y arquitectura  | Draw.io / Lucidchart     |                    |     |
|                          | Entrevistas              | semiestructuradas  | /   |
Levantamiento de requerimientos
Google Forms
| Análisis comparativo   | Matriz de benchmarking                  |     |     |
| ---------------------- | --------------------------------------- | --- | --- |
| Gestión funcional      | Historias de usuario / Product backlog  |     |     |
| Pruebas                | Plan de Pruebas de Software (PPS)       |     |     |
| Pruebas                | Casos de prueba                         |     |     |
| Pruebas de integridad  | Pruebas de mutación documental          |     |     |
Evaluación del desempeño  Indicadores clave de rendimiento (KPI)
Fuente: Elaborado por las autoras
Para más detalles mirar el anexo E.

|     |     |     |     |     |     |     |
| --- | --- | --- | --- | --- | --- | --- |

7.  PRODUCTO A ENTREGAR

Tabla 3. Descripción de componentes del producto a entregar

Lugar de
| Entregable  |     |     |     | Descripción  |     |     |
| ----------- | --- | --- | --- | ------------ | --- | --- |
entrega
|     |     |     | Repositorio  | con  el  código  | completo  | del  |
| --- | --- | --- | ------------ | ---------------- | --------- | ---- |
Código  fuente  del     frontend,  backend  y  chaincode  de
| sistema web  |     | GitHub  | Hyperledger    | Fabric,      | incluyendo  | la   |
| ------------ | --- | ------- | -------------- | ------------ | ----------- | ---- |
|              |     |         | configuración  | de  la  red  | blockchain  | con  |
Docker Compose.

|     |     |     | Documento que describe el uso del sistema  |      |                 |     |
| --- | --- | --- | ------------------------------------------ | ---- | --------------- | --- |
|     |     |     | web,  incluyendo                           | los  | procedimientos  | de  |
Manual de usuario  GitHub  registro, verificación, consulta y trazabilidad
documental.
|            |     |     | Especificación de la arquitectura del sistema,  |                 |      |     |
| ---------- | --- | --- | ----------------------------------------------- | --------------- | ---- | --- |
| Documento  | de  |     | incluyendo                                      | los  diagramas  | UML  | de  |
arquitectura técnica  GitHub  componentes,  secuencia,  despliegue  y  la
topología de la red Hyperledger Fabric.
|     |     |     | Documento que define los casos de prueba  |                 |              |     |
| --- | --- | --- | ----------------------------------------- | --------------- | ------------ | --- |
|     |     |     | funcionales,                              | de  integridad  | documental,  | de  |
Plan  de  pruebas  GitHub  trazabilidad y de rendimiento operativo, con
| QA/QC  |     |             | sus criterios de aceptación y resultados.  |     |     |     |
| ------ | --- | ----------- | ------------------------------------------ | --- | --- | --- |
|        |     | Biblioteca  | Documento académico completo entregado a   |     |     |     |
Documento  de  Universidad  la  facultad  de  Ingeniería,  que  recoge  la
trabajo de grado  Católica de  propuesta,  desarrollo,  evaluación  y
|     |     | Colombia  | conclusiones del proyecto.  |     |     |     |
| --- | --- | --------- | --------------------------- | --- | --- | --- |

Fuente: Elaborado por las autoras.

7.1 Valor empresarial del sistema propuesto
El sistema web propuesto responde a problemáticas concretas identificadas en la
gestión  de  contratos  laborales  digitales  en  el  sector  de  Tecnologías  de  la
Información en Colombia. A continuación, se presenta la correspondencia entre los
problemas identificados, las soluciones que el sistema aporta y los resultados
esperados en el contexto organizacional.

|     |     |     |     |     |     |     |     |     |     |     |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

Tabla 4. Problemas, soluciones y resultados esperados del sistema

| Problema  |     | Solución aportada por el  |     |     |     |     |     |     |     |     |
| --------- | --- | ------------------------- | --- | --- | --- | --- | --- | --- | --- | --- |
Resultado esperado
| identificado  |     |     | sistema  |     |     |     |     |     |     |     |
| ------------- | --- | --- | -------- | --- | --- | --- | --- | --- | --- | --- |
Es posible demostrar que un
|         |          | El  sistema                     | registra  |     | la  huella  | documento  | existía     |     | con  | un  |
| ------- | -------- | ------------------------------- | --------- | --- | ----------- | ---------- | ----------- | --- | ---- | --- |
| No  es  | posible  |                                 |           |     |             |            |             |     |      |     |
|         |          | criptográfica del documento en  |           |     |             | contenido  | específico  |     | en   | un  |
demostrar cuál es el
|     |     | la  blockchain  |     | con  | marca  | momento  |     | determinado,  |     |     |
| --- | --- | --------------- | --- | ---- | ------ | -------- | --- | ------------- | --- | --- |
documento original.
|     |     | temporal inmutable.  |     |     |     | constituyendo  |     |     | evidencia  |     |
| --- | --- | -------------------- | --- | --- | --- | -------------- | --- | --- | ---------- | --- |
técnica verificable.
|         |        | La  versión  |      | verificable  | se    | Se elimina la dependencia del   |     |     |     |     |
| ------- | ------ | ------------ | ---- | ------------ | ----- | ------------------------------- | --- | --- | --- | --- |
| No  se  | puede  |              |      |              |       |                                 |     |     |     |     |
|         |        | determina    | por  | el           | hash  | correo electrónico como fuente  |     |     |     |     |
identificar cuál es la
|                   |      | registrado en blockchain, no por  |     |     |     | de verdad y se establece un  |     |           |     |     |
| ----------------- | ---- | --------------------------------- | --- | --- | --- | ---------------------------- | --- | --------- | --- | --- |
| versión  oficial  | del  |                                   |     |     |     |                              |     |           |     |     |
|                   |      | el nombre del archivo ni el hilo  |     |     |     | mecanismo                    |     | objetivo  |     | de  |
contrato.
|     |     | de correo electrónico.  |     |     |     | identificación documental.  |     |     |     |     |
| --- | --- | ----------------------- | --- | --- | --- | --------------------------- | --- | --- | --- | --- |
El sistema recalcula el hash del
|             |       | documento y lo compara contra  |     |            |            | Las         | alteraciones  |            | son    |     |
| ----------- | ----- | ------------------------------ | --- | ---------- | ---------- | ----------- | ------------- | ---------- | ------ | --- |
| No  existe  | un    |                                |     |            |            |             |               |            |        |     |
|             |       | el  registro                   |     | inmutable  | en         | detectadas  |               | de         | forma  |     |
| mecanismo   | para  |                                |     |            |            |             |               |            |        |     |
|             |       | blockchain.                    |     |            | Cualquier  | automática  | y             | objetiva,  | sin    |     |
detectar alteraciones
|     |     | modificación,  |     | por  mínima  | que  | depender de revisión visual ni  |     |     |     |     |
| --- | --- | -------------- | --- | ------------ | ---- | ------------------------------- | --- | --- | --- | --- |
en los documentos.
|     |     | sea,  produce  |     | una  | huella  | peritaje posterior.  |     |     |     |     |
| --- | --- | -------------- | --- | ---- | ------- | -------------------- | --- | --- | --- | --- |
diferente.
Se mejora significativamente la
|                        |          | El  sistema   | genera       |     | evidencia  |                               |             |                 |          |     |
| ---------------------- | -------- | ------------- | ------------ | --- | ---------- | ----------------------------- | ----------- | --------------- | -------- | --- |
| No  se  cuenta         | con      |               |              |     |            | calidad                       | probatoria  |                 | de  los  |     |
|                        |          | técnica       | verificable  |     | con        |                               |             |                 |          |     |
| prueba técnica sólida  |          |               |              |     |            | documentos                    |             | contractuales,  |          |     |
|                        |          | anterioridad  |              | a   | cualquier  |                               |             |                 |          |     |
| ante  una              | disputa  |               |              |     |            | reduciendo la dependencia de  |             |                 |          |     |
|                        |          | disputa,      | basada       | en  | registros  |                               |             |                 |          |     |
| legal.                 |          |               |              |     |            | peritajes                     |             | informáticos    |          |     |
criptográficos inmutables.
posteriores.
El proceso depende  El  sistema  no  elimina  la  El  modelo  de  confianza  se
de la buena fe de las  posibilidad de edición externa,  desplaza de la buena fe hacia
partes,  sin  pero hace detectable cualquier  la verificación técnica objetiva,
mecanismos  de  modificación  respecto  al  fortaleciendo  el  control
| prevención.  |     | documento registrado.  |     |     |     | documental.  |     |     |     |     |
| ------------ | --- | ---------------------- | --- | --- | --- | ------------ | --- | --- | --- | --- |
Fuente: Elaborado por las autoras.
Es importante precisar que el sistema propuesto no constituye una solución integral
a todos los riesgos asociados a la gestión documental digital. En particular, el
sistema no resuelve situaciones de fuga del documento por fuera del entorno del
sistema, reenvío externo de copias, impresión, exfiltración previa al registro, ni
sustituye mecanismos de firma digital certificada con infraestructura de clave pública
(PKI) de validez jurídica plena. Estas limitaciones son coherentes con el alcance
definido para el MVP y no comprometen la utilidad del sistema como mecanismo de
verificación de integridad y trazabilidad documental en el contexto organizacional
planteado.

7.2. Seguridad por módulo del sistema
El sistema web está compuesto por ocho módulos funcionales que incorporan
mecanismos de seguridad distribuidos a lo largo de toda la arquitectura, con el
objetivo de proteger la gestión y verificación de documentos contractuales. Entre los
componentes más relevantes se encuentran:
Módulo de autenticación y control de acceso: Garantiza que solo usuarios
autorizados puedan realizar operaciones mediante validación de credenciales y
control basado en roles; el módulo de carga y validación documental, que verifica la
integridad básica de los archivos antes de su procesamiento.
Módulo de generación de huellas criptográficas: encargado de crear un hash
SHA-256 único para cada documento, constituyendo el principal mecanismo de
verificación de integridad. Asimismo, el sistema almacena únicamente metadatos y
referencias de consulta, evitando conservar el contenido completo de los contratos
y contribuyendo al cumplimiento de la Ley 1581 de 2012 sobre protección de datos
personales [8].
El módulo de registro en blockchain: Traslada la evidencia de integridad a un
registro distribuido e inmutable en la red Hyperledger Fabric, protegiendo los
registros frente a modificaciones posteriores. El módulo de consulta y verificación
permite detectar alteraciones documentales mediante la comparación objetiva entre
el hash actual del archivo y el hash registrado en blockchain.
El módulo de trazabilidad: Recupera el historial cronológico de acciones
directamente desde el ledger de Hyperledger Fabric, garantizando que el registro
de operaciones no pueda ser alterado desde la base de datos operativa. Finalmente,
el módulo de infraestructura y despliegue implementa una arquitectura contenida en
Docker, que segmenta los componentes del sistema y controla sus dependencias,
reduciendo la superficie de exposición a riesgos operativos.
Para más detalles mirar el anexo F.

8. CRONOGRAMA
En la búsqueda del cumplimiento de los objetivos que se han propuesto se plantea
el siguiente cronograma:
Tabla 5. Cronograma
Fuente: Elaborado por las autoras.

9. PRESUPUESTO
Tabla 6. Presupuesto
Fuente: Elaborado por las autoras.

10. REFERENCIAS
[1]FEDESOFT. Caracterización del Sector TI en Colombia. Bogotá: Federación
Colombiana de la Industria de Software y Tecnologías de la Información
Relacionadas, 2023. [en línea]. Disponible en: https://fedesoft.org/
[2] CONGRESO DE LA REPÚBLICA DE COLOMBIA. Ley 527 de 1999: por medio
de la cual se define y reglamenta el acceso y uso de los mensajes de datos, del
comercio electrónico y de las firmas digitales. Bogotá: Función Pública, 18 de agosto
de 1999. [en línea]. Disponible en:
https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=4276
[3] MINISTERIO DE TECNOLOGÍAS DE LA INFORMACIÓN Y LAS
COMUNICACIONES. Guía de Referencia para la adopción e implementación de
proyectos con tecnología blockchain para el Estado colombiano. Versión 2. Bogotá:
MinTIC, mayo de 2022. [en línea]. Disponible en:
https://portalelearning.mintic.gov.co/
[4] HABER, Stuart y STORNETTA, W. Scott. How to time-stamp a digital document.
Journal of Cryptology. 1991, vol. 3, n.º 2, pp. 99-111. DOI 10.1007/BF00196791.
[5] NATIONAL INSTITUTE OF STANDARDS AND TECHNOLOGY. SHA-3
Standard: Permutation-Based Hash and Extendable-Output Functions. FIPS
Publication 202. Gaithersburg: NIST, agosto 2015. DOI 10.6028/NIST.FIPS.202.
[6] INTERNET ENGINEERING TASK FORCE (IETF). RFC 3161: Internet X.509
Public Key Infrastructure Time-Stamp Protocol (TSP). ZUCCHERATO, R., et al.
2001. [en línea]. Disponible en: https://tools.ietf.org/html/rfc3161.
[7] HYPERLEDGER FOUNDATION. Public networks: Besu documentation. 2023.
[en línea]. Disponible en: https://besu.hyperledger.org/.
[8] CONGRESO DE LA REPÚBLICA DE COLOMBIA. Ley 1581 de 2012: por la cual
se dictan disposiciones generales para la protección de datos personales. Diario
Oficial n.º 48.587. Bogotá: Función Pública, 17 de octubre de 2012. [en línea].
Disponible en:
https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981.
[9] PRESIDENCIA DE LA REPÚBLICA DE COLOMBIA. Decreto 2364 de 2012: por
medio del cual se reglamenta el artículo 7° de la Ley 527 de 1999, sobre la firma
electrónica. Diario Oficial n.º 48.622. Bogotá: Función Pública, 22 de noviembre de
2012. [en línea]. Disponible en:
https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=50550
[10] INTERNATIONAL ORGANIZATION FOR STANDARDIZATION. ISO/IEC
27001:2022 - Information security, cybersecurity and privacy protection —
Information security management systems — Requirements. Ginebra: ISO, octubre
2022.
[11] ZHENG, Zibin, et al. An overview on smart contracts: challenges, advances and

platforms. Future Generation Computer Systems. 2020, vol. 105, pp. 475-491. DOI
10.1016/j.future.2019.12.019.
[12] MIER BELLO, Germán S., et al. A Scientific Data Integrity system based on
Blockchain. Bucaramanga: Universidad Industrial de Santander, 2026. [en línea].
Disponible en: https://arxiv.org/abs/2601.13425.
[13] NAJEEB, M., et al. Securing e-governance against shadow attacks with
blockchain technology. Scientific Reports. 2025, vol. 15, art. 8456. DOI
10.1038/s41598-025-26326-0.
[14] TRUST4P. Manejo de contratos en TRUST4P: Riesgos Legales y Pruebas.
[Documento técnico interno]. 2025.
[15] DÍAZ MICHEL, Claudia y LLAMAS COVARRUBIAS, Jersain Zadamig.
Contratos y blockchain: Contratos legales inteligentes. ¿Es necesario un marco
legislativo? RITI Journal. 2023, vol. 11, n.º 23, pp. 42-58. DOI
10.36825/RITI.11.23.005.
[16] ACOSTA-LEÓN, Carlos Alfonso. La prueba documental de fuentes informáticas
basadas en documentos digitales con firma electrónica certificada. Revista Chilena
de Derecho y Tecnología. 2023, vol. 12, n.º 1, e68567. DOI 10.5354/0719-
2584.2023.68567.
[17] MENDOZA MENDOZA, Ingrid Esthela. Análisis de la Auditoría Forense: Gestor
estratégico para la prevención del fraude financiero. Revisión Documental. Artículo
científico previo a la obtención del título de Licenciada. Santo Domingo: Universidad
Regional Autónoma de los Andes, 2023.
[18] CASTAÑEDA-ORTEGA, Fabian Andrés. Ciberdelincuencia: análisis de
tendencias y estrategias de mitigación, caso Colombia. Revista Portal de la Ciencia.
2024, vol. 5, n.º 3, pp. 298-308. DOI 10.51247/pdlc.v5i3.474.
[19] MOSCOSO URDANETA, Steve Eduardo, SUÁREZ CHACÓN, David Felipe y
MARTIN VEGA, Daniela. Certificación digital de documentos académicos basada
en la tecnología de blockchain. TIA. 2019, vol. 7, n.º 2, pp. 20-27. DOI
10.14483/23448288.12757.
[20] PRECHT, Hauke, HÜLLMANN, Joschka Andreas y MARX GÓMEZ, Jorge.
Paperless Everything: A Systematic Literature Review for the Design of Blockchain-
based Document Management Systems. Distributed Ledger Technologies:
Research and Practice. 2026, vol. 5, n.º 2, art. 19. DOI 10.1145/3737296.
[21] DE LA FUENTE MARTÍN, Alba. Aplicación de blockchain en sistemas de
trazabilidad documental. Trabajo de fin de grado en Ingeniería Informática.
Valladolid: Universidad de Valladolid, 2024.
[22] SÁNCHEZ GÓMEZ, Pablo. Modelos de gestión documental con blockchain
para verificación de integridad. Trabajo de fin de grado en Ingeniería Informática.
Valladolid: Universidad de Valladolid, 2025.

[23] MALAGÓN CABALLERO, David Santiago y RAMÍREZ FRANCO, Cristian
Felipe. Desarrollo de un prototipo de aplicación web para la verificación de
autenticidad de títulos académicos mediante el uso de blockchain. Tesis de grado
para optar al título de Ingeniero de Sistemas. Bogotá: Universidad Piloto de
Colombia, 2022.
[24] MAURAS VELEZ, Agustín Leonel. Verificador de integridad de documentos con
tecnología blockchain para la Universidad Católica de Córdoba. Trabajo final de
grado para optar al título de Ingeniero en Sistemas. Córdoba: Universidad Católica
de Córdoba, Facultad de Ingeniería, 2022.
[25] HYPERLEDGER FOUNDATION. A Blockchain Platform for the Enterprise —
Hyperledger Fabric Docs main documentation. 2023. [en línea]. Disponible en:
https://hyperledger-fabric.readthedocs.io/
[26] REHAN, Muhammad, et al. Supply chain management using an industrial
Internet of Things Hyperledger Fabric network. Human-centric Computing and
Information Sciences. 2023, vol. 13, art. 4. DOI 10.22967/HCIS.2023.13.004.
[27] VACA, Pablo A. y DULCE-VILLARREAL, Edgar R. Blockchain para asegurar la
integridad y trazabilidad en la cadena de custodia de evidencia digital en informática
forense: un estudio de mapeo sistemático. TecnoLógicas. 2024, vol. 27, n.º 60,
e3049. DOI 10.22430/22565337.3049.
[28] CASINO, Fran, DASAKLIS, Thomas K. y PATSAKIS, Constantinos. A
systematic literature review of blockchain-based applications: current status,
classification and open issues. Telematics and Informatics. 2019, vol. 36, pp. 55-81.
DOI 10.1016/j.tele.2018.11.006.
[29] ROCHA, Ronaldo, LIMA, Gercina Ângela y ARAÚJO, Wálter José. Blockchain
como tecnologia aplicada na elaboração de contratos inteligentes na
Biblioteconomia e Ciência da Informação (BCI): uma revisión sistemática da
literatura. AtoZ: novas prácticas em informação e conhecimento. 2025, vol. 14, pp.
1-9. DOI 10.5380/atoz.v14.91194.
[30] BANNIKOV, Valentyn, et al. Analysis of the use of blockchain technologies and
smart contracts to automate management processes and ensure sustainability. Data
and Metadata. 2024, vol. 3, art. 461. DOI 10.56294/dm2024461.
[31] GÓMEZ GARCÍA, Anays; SOSA HERNÁNDEZ, Mercedes; VERONA
MARCOS, Sandra y DELGADO DAPENA, Martha Dunia. Buenas prácticas de
ingeniería de software: pruebas de software. Revista Cubana de Transformación
Digital, 2023, vol. 4, n.° 2, pp. 1-13. ISSN 2708-3411.
[32] SIMROTH, Paul. Key Performance Indicators on the Blockchain: A Guide. Paul
Simroth Blog, 2024. [en línea]. Disponible en: https://paulsimroth.at/
[33] CORRAL, Roberto. KPIs útiles: diseña indicadores operativos que realmente
sirvan para mejorar. 1.ª ed. Barcelona: LEEXONLINE, 2017

[34] XIA, Yinbin, et al. Revocable signature: handling valid but unauthorized Non-
Fungible Token through auxiliary embedded key. Cybersecurity. 2026, vol. 9, art. 97.
DOI 10.1186/s42400-025-00544-5.
[35] HERMAN, Ivan, et al. Verifiable Credentials Data Model v2.0. W3C
Recommendation. W3C, 15 de mayo de 2025. [en línea]. Disponible en:
https://www.w3.org/TR/vc-data-model-2.0/. [Consulta: 1 mayo 2026].
[36] REMUZGO PINTO, Marcos. Blockchain para gobiernos digitales. Trabajo de fin
de grado. Valencia: Universitat Politècnica de València, 2021.
[37] LF DECENTRALIZED TRUST. Benchmarking Hyperledger Fabric 2.5
Performance [en línea]. 16 de febrero de 2023. Disponible en:
https://www.lfdecentralizedtrust.org/blog/2023/02/16/benchmarking-hyperledger-
fabric-2-5-performance
[38] AGUDELO TARAZONA, Y. E. Prospectiva de los Smart Contracts para el
derecho procesal civil en Colombia [en línea]. Revista Academia & Derecho. 2024.
[Consulta: 3 de mayo de 2026]. Disponible en:
https://dialnet.unirioja.es/descarga/articulo/9637062.pdf
[39] IMAGINA COLOMBIA. Servidores Virtuales Privados (VPS SSD) [en línea].
2025. Disponible en: https://www.imaginacolombia.com/servidores-virtuales-
privados/vps-ssd
[40] CLICKPANDA. Precios de servidores en Colombia: guía completa 2025 [en
línea]. 2025. Disponible en: https://blog.clickpanda.com/novedades/cuanto-cuesta-
servidor-en-colombia/
[41] GOOGLE CLOUD. Document AI Pricing [en línea]. 2026. Disponible en:
https://cloud.google.com/document-ai/pricing
[42] COLOMBIA. CORTE SUPREMA DE JUSTICIA. Sentencia SP248-2025 (Rad.
5827) [en línea]. M.P. Gerson Chaverra Castro. 20 de enero de 2026. Disponible
en: https://rsanabria.co/2026/01/20/la-ausencia-del-hash-no-invalida-la-evidencia-
digital-afecta-su-fuerza-probatoria/
[43] COLOMBIA. SUPERINTENDENCIA DE INDUSTRIA Y COMERCIO. Circular
Externa 005 de 2017: Estándares de un nivel adecuado de protección de datos
personales... [en línea]. 10 de agosto de 2017. Disponible en: https://www.suin-
juriscol.gov.co/viewDocument.asp?id=30035611
[44] IS3ados. Los ciclos de vida del software (II). 2008. [en línea]. Disponible en:
https://is3ados.blogspot.com/2008/11/los-ciclos-de-vida-del-software-ii.html
[45] INTERNATIONAL ORGANIZATION FOR STANDARDIZATION. ISO 15489-
1:2016 Información y documentación, Gestión de registros. Ginebra: ISO, 2016. [en
línea]. Disponible en: https://www.iso.org/standard/62542.html.

11. ANEXOS
Anexo A. Tabla Kpis, sección de detalle Smart y leyenda
https://docs.google.com/spreadsheets/d/1cO1-
oBXKt5qYF2KK1xz6c04qQks1ypvV/edit?usp=sharing&ouid=10384707997056532
9212&rtpof=true&sd=true
Anexo B. Backlog del producto
https://docs.google.com/spreadsheets/d/1hQUxVLmCMqsggUUuxeBp9dURX0zbc
d7K/edit?usp=sharing&ouid=106503627369134360487&rtpof=true&sd=true
Anexo C. Benchmarking Comparativo con GCP
https://docs.google.com/spreadsheets/d/1we3govhNrqcMG9Afc1MbL6KJMMgLvF
Hi/edit?usp=sharing&ouid=103847079970565329212&rtpof=true&sd=true
Anexo D. Plan de pruebas
https://github.com/alwaysprafull/SoftwareTestingProjects.git
Anexo E. Tabla detallada de instrumentos y herramientas
https://docs.google.com/spreadsheets/d/1_Xu1Mjjo_EnP5wHlL2ZxRWSAjq1v48Vf/
edit?usp=sharing&ouid=103847079970565329212&rtpof=true&sd=true
Anexo F. Seguridad por módulo en el sistema
https://docs.google.com/spreadsheets/d/1pVV3RbQzzWVSEsZiYaR3zwDHDLjgxO
o8/edit?usp=sharing&ouid=106503627369134360487&rtpof=true&sd=true
Anexo G. Presupuesto
https://docs.google.com/spreadsheets/d/1iMNFib2e3aMUI7JgNx2N6AjoLOCVL53
F/edit?usp=sharing&ouid=106503627369134360487&rtpof=true&sd=true
Anexo H. Cronograma, el resumen por semana y Leyenda
https://docs.google.com/spreadsheets/d/1RtKEfpCEndIE82O1JcSsVPXdzzOyjbX2
/edit?usp=sharing&ouid=106503627369134360487&rtpof=true&sd=true