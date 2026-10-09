## Requerimientos Funcionales

## 1. Autenticación y acceso

**RF-001. Inicio de sesión**

El sistema deberá permitir al usuario iniciar sesión ingresando únicamente su correo electrónico corporativo y su contraseña.

**RF-002. Autenticación mediante credenciales**

El sistema deberá solicitar al usuario sus credenciales corporativas, compuestas por correo electrónico y contraseña, para iniciar el proceso de autenticación.

**RF-003. Autenticación de segundo factor**

El sistema deberá enviar un token de verificación al correo corporativo registrado del usuario como segundo factor de autenticación. El token deberá tener una vigencia de 5 minutos, ser de un solo uso y poder reenviarse como máximo una vez cada 60 segundos.

**RF-004. Validación del token**

El sistema deberá validar el token ingresado por el usuario antes de concederle acceso a la plataforma. El sistema deberá invalidar el token tras 3 intentos fallidos de ingreso, exigiendo al usuario iniciar nuevamente el proceso de autenticación.

**RF-005. Asignación de rol y control de acceso**

El sistema deberá permitir el acceso únicamente cuando las credenciales y el token sean válidos, y deberá identificar automáticamente el rol del usuario (Administrador, Empleado o Verificador) a partir de su cuenta registrada. Cada usuario tendrá un único rol asignado.

**RF-006. Redirección según rol**

El sistema deberá mostrar al usuario el panel principal y las funcionalidades correspondientes al rol asignado a su cuenta después de completar satisfactoriamente la autenticación.

**RF-007. Cierre de sesión**

El sistema deberá permitir a cualquier usuario cerrar su sesión de forma segura.

## 2. Funcionalidades del rol Empleado

**RF-008. Carga de documentos**

El sistema deberá permitir al usuario con rol Empleado cargar documentos contractuales en formato PDF para su registro y posterior verificación de integridad.

**RF-009. Restricción de formato**

El sistema deberá aceptar exclusivamente archivos con formato PDF.

**RF-010. Restricción de carga individual**

El sistema deberá permitir la carga de un único documento por operación y no deberá admitir cargas masivas o por lotes.

**RF-011. Restricción de tamaño**

El sistema deberá aceptar únicamente archivos PDF cuyo tamaño sea igual o inferior a 20 MB.

**RF-012. Validación previa de documentos**

El sistema deberá validar el formato y tamaño del archivo antes de iniciar su registro.

**RF-013. Registro del documento**

El sistema deberá registrar los metadatos asociados al documento cargado, incluyendo como mínimo su identificador, nombre, usuario responsable y fecha de registro.

**RF-014. Generación de huella criptográfica**

El sistema deberá generar automáticamente una huella criptográfica mediante el algoritmo SHA-256 a partir del contenido del documento cargado. El uso de SHA-256 se encuentra definido en el alcance técnico del proyecto.

**RF-015. Registro de la huella criptográfica**

El sistema deberá registrar la huella criptográfica generada como evidencia de integridad del documento.

**RF-016. Registro en blockchain**

El sistema deberá registrar en la red blockchain permisionada (Hyperledger Fabric) la huella criptográfica y los eventos asociados al documento, sin almacenar el archivo PDF directamente en la blockchain.

**RF-017. Confirmación de registro**

El sistema deberá informar al empleado cuando el documento haya sido registrado correctamente y su huella criptográfica haya sido generada.

**RF-018. Consulta de documentos**

El sistema deberá permitir al empleado consultar los documentos que haya registrado en la plataforma.

**RF-019. Información del documento**

El sistema deberá mostrar, como mínimo, el nombre del documento, identificador, fecha de registro y estado actual.

**RF-020. Estado del documento**

El sistema deberá mostrar para cada documento uno de los siguientes estados: Pendiente, Verificado o Alterado.

**RF-021. Consulta de trazabilidad**

El sistema deberá permitir al empleado consultar el historial de acciones asociadas a sus documentos.

**RF-022. Información de trazabilidad**

El sistema deberá mostrar en la trazabilidad el documento asociado, la acción realizada, el usuario responsable, el identificador de transacción (txID) generado en Hyperledger Fabric, y la fecha y hora del evento.

**Nota de cambio:** Se agrega el campo txID para alinear este requerimiento con RNF-027, que exige conservar el identificador de transacción como evidencia de auditoría.

## 3. Funcionalidades del rol Verificador

**RF-023. Acceso al módulo de verificación**

El sistema deberá permitir al usuario con rol Verificador acceder al módulo de verificación de integridad documental.

**RF-024. Selección del documento registrado**

El sistema deberá permitir al verificador seleccionar un documento previamente registrado en el sistema para realizar su verificación.

**RF-025. Validación de existencia**

El sistema deberá consultar mediante el identificador del documento si este se encuentra previamente registrado en el sistema.

**RF-026. Consulta de huella registrada**

El sistema deberá mostrar al verificador la huella criptográfica registrada para el documento seleccionado.

**RF-027. Restricción de visualización del hash**

La huella criptográfica completa deberá ser visible únicamente para los usuarios autorizados, de acuerdo con las reglas de acceso definidas para el rol Verificador y Administrador.

**RF-028. Carga del documento a verificar**

El sistema deberá permitir al verificador cargar el documento PDF que será comparado con la versión previamente registrada.

**RF-029. Validación del documento de comparación**

El sistema deberá verificar que el documento utilizado para la comparación cumpla con las restricciones de formato PDF y tamaño máximo de 20 MB.

**RF-030. Generación de hash del documento de comparación**

El sistema deberá generar mediante SHA-256 la huella criptográfica del documento cargado para la verificación.

**RF-031. Comparación de huellas**

El sistema deberá permitir al verificador ejecutar la comparación entre la huella criptográfica registrada y la huella generada a partir del documento cargado.

**RF-032. Resultado de la verificación**

El sistema deberá determinar automáticamente el resultado de la comparación y mostrar si la integridad del documento es confirmada o comprometida.

**RF-033. Visualización de evidencia**

El sistema deberá mostrar al verificador la huella criptográfica original y la huella criptográfica obtenida del documento actual como evidencia del resultado de la comparación.

**RF-034. Actualización del estado**

El sistema deberá actualizar automáticamente el estado del documento a Verificado cuando las huellas coincidan o a Alterado cuando las huellas sean diferentes.

**RF-035. Registro de la verificación**

El sistema deberá registrar en la trazabilidad la acción de verificación, el usuario que la realizó, la fecha y hora, el identificador de transacción (txID) generado en Hyperledger Fabric, y el resultado obtenido.

**Nota de cambio:** Se agrega el campo txID por la misma razón indicada en RF-022.

**RF-036. Nueva verificación**

El sistema deberá proporcionar una opción denominada "Nueva verificación" que permita iniciar un nuevo proceso de verificación.

**RF-037. Consulta de documentos registrados**

El sistema deberá permitir al verificador consultar los documentos registrados en el sistema.

**RF-038. Vista de documentos del verificador**

El sistema deberá mostrar al verificador, como mínimo, el nombre del documento, identificador, usuario responsable, fecha de registro, estado y huella criptográfica, de acuerdo con sus permisos de acceso.

**RF-039. Consulta de trazabilidad general**

El sistema deberá permitir al verificador consultar el historial completo de acciones registradas sobre los documentos.

**RF-040. Información de trazabilidad general**

La trazabilidad general deberá presentar como mínimo los campos Documento, Acción, Usuario, Identificador de transacción (txID), Fecha y Resultado.

## 4. Funcionalidades del rol Administrador

**RF-041. Panel general**

El sistema deberá proporcionar al Administrador un panel general con información consolidada sobre el estado de los documentos registrados.

**RF-042. Resumen documental**

El panel general deberá mostrar como mínimo el número total de documentos registrados, documentos verificados, documentos pendientes y documentos alterados.

**RF-043. Consulta de usuarios**

El sistema deberá permitir al Administrador consultar los usuarios registrados en la plataforma.

**RF-044. Información de usuarios**

El sistema deberá mostrar para cada usuario, como mínimo, su identificador, nombre, rol, correo electrónico y estado (Activo / Inactivo).

**RF-045. Creación de usuarios**

El sistema deberá permitir al Administrador registrar nuevos usuarios en la plataforma, asignándoles un correo electrónico corporativo y uno de los tres roles definidos.

**RF-046. Edición de usuarios**

El sistema deberá permitir al Administrador modificar el nombre, correo electrónico y rol de los usuarios registrados.

**RF-047. Desactivación de usuarios**

El sistema deberá permitir al Administrador desactivar el acceso de un usuario registrado (baja lógica), sin eliminar físicamente su información ni afectar la trazabilidad histórica asociada a sus acciones previas.

**Nota de cambio:** Requerimiento nuevo. Complementa RF-045/RF-046 y da cobertura completa al ciclo de vida de usuarios exigido por el esquema RBAC de RNF-003.

**RF-048. Consulta administrativa de documentos**

El sistema deberá permitir al Administrador consultar los documentos registrados en el sistema.

**RF-049. Vista administrativa de documentos**

El sistema deberá mostrar al Administrador, como mínimo, el nombre del documento, identificador, usuario responsable, fecha de registro, estado y huella criptográfica, respetando las restricciones de privacidad definidas para la información.

**RF-050. Consulta de trazabilidad administrativa**

El sistema deberá permitir al Administrador consultar el registro histórico de las acciones realizadas sobre los documentos.

**RF-051. Registro administrativo de trazabilidad**

El sistema deberá presentar la trazabilidad mediante una tabla que contenga, como mínimo, el identificador del documento, acción realizada, usuario responsable, identificador de transacción (txID) generado en Hyperledger Fabric, fecha y hora, y resultado obtenido.

**Nota de cambio:** Se agregan los campos txID y Resultado. Este último iguala el nivel de información que ya recibía el rol Verificador en RF-040, evitando que el panel de Administrador mostrara menos datos que un rol de menor jerarquía.

## 5. Gestión de credenciales

**RF-052. Cambio de contraseña**

El sistema deberá permitir a los usuarios autenticados cambiar su contraseña.

**RF-053. Validación de cambio de contraseña**

El sistema deberá solicitar la contraseña actual y la nueva contraseña antes de realizar el cambio, validando que la operación sea realizada por el usuario autenticado.

**6. Seguridad de acceso y protección de datos**

**RF-054. Bloqueo por intentos fallidos**

El sistema deberá bloquear temporalmente el acceso de una cuenta durante 15 minutos tras 5 intentos consecutivos fallidos de autenticación.

**RF-055. Aceptación de la política de tratamiento de datos**

El sistema deberá presentar la política de tratamiento de datos personales en el primer inicio de sesión de cada usuario y condicionar el acceso a las demás funcionalidades a su aceptación, registrando el usuario, la fecha, la hora y la versión de la política aceptada.

**Requerimientos no Funcionales**

## Seguridad

**RNF-001. Protección de contraseñas**

El sistema deberá almacenar las contraseñas utilizando un mecanismo de hashing seguro con salt y no deberá almacenarlas en texto plano.

**RNF-002. Autenticación segura**

El sistema deberá implementar autenticación mediante credenciales y un segundo factor de verificación mediante token.

**RNF-003. Control de acceso**

El sistema deberá aplicar un esquema de control de acceso basado en roles (RBAC), garantizando que cada usuario únicamente pueda acceder a las funcionalidades y datos autorizados para su rol.

**RNF-004. Protección de información sensible**

El sistema no deberá almacenar el contenido de los contratos laborales ni acuerdos de confidencialidad directamente en la red blockchain. La blockchain deberá almacenar únicamente las huellas criptográficas y los eventos necesarios para la trazabilidad. Esto corresponde directamente al modelo de persistencia definido en el proyecto.

**RNF-005. Integridad de la evidencia**

Las huellas criptográficas registradas en la blockchain deberán conservarse de manera inmutable, de forma que no puedan ser modificadas mediante las operaciones normales del sistema.

**RNF-006. Trazabilidad de operaciones**

El sistema deberá registrar las operaciones relevantes realizadas sobre los documentos, incluyendo usuario, acción, fecha, hora y resultado cuando corresponda. Adicionalmente, el sistema deberá registrar los intentos fallidos de acceso a la plataforma, incluyendo correo ingresado, fecha, hora y motivo del fallo, sin almacenar la contraseña ingresada.

**RNF-007. Protección de sesiones**

El sistema deberá gestionar las sesiones de usuario de manera segura, cerrando automáticamente la sesión tras 15 minutos de inactividad e impidiendo el acceso a funcionalidades protegidas una vez finalizada o expirada la sesión.

**RNF-008. Privacidad**

El sistema deberá limitar la exposición de información documental y de las huellas criptográficas de acuerdo con los permisos establecidos para cada rol.

## Rendimiento

**RNF-009. Tiempo de respuesta**

El sistema deberá responder a las operaciones principales de consulta de documentos y trazabilidad (RF-018, RF-021, RF-037, RF-039) con un percentil 95 del tiempo de respuesta menor o igual a 3.000 ms, medido en 50 peticiones consecutivas sobre el entorno Docker local de pruebas.

**RNF-010. Rendimiento de verificación**

La operación de verificación de integridad deberá cumplir como meta un percentil 95 de latencia igual o inferior a 3.000 ms en 50 peticiones consecutivas, de acuerdo con el KPI definido en el proyecto. (cubre solo verificación)

**RNF-011. Procesamiento criptográfico**

La generación y comparación de las huellas SHA-256 deberá realizarse de manera automática sin requerir intervención manual del usuario.

## Disponibilidad y confiabilidad

**RNF-012. Disponibilidad del sistema**

El sistema deberá mantener una disponibilidad mayor o igual al 95 % durante el periodo de pruebas definido para el MVP (1 mes), medida mediante una verificación automática de estado cada 5 minutos. Se considerará indisponible todo intervalo en que la verificación falle.

**RNF-013. Consistencia de información**

La información registrada en la base de datos no relacional (MongoDB) y la evidencia almacenada en la red blockchain permisionada (Hyperledger Fabric) deberán mantener correspondencia respecto a los documentos, identificadores y eventos registrados.

**Nota de cambio:** Se reemplaza el término genérico "base de datos" por "base de datos no relacional (MongoDB)" y se nombra explícitamente Hyperledger Fabric, para anclar el requerimiento al marco tecnológico definido en el proyecto.

**RNF-014. Confiabilidad de la verificación**

El sistema deberá detectar las alteraciones realizadas sobre los documentos utilizados durante las pruebas de integridad. Como meta del proyecto, deberá detectar el 100 % de las alteraciones realizadas sobre los 20 documentos definidos para la validación.

## Usabilidad

**RNF-015. Facilidad de uso**

Los usuarios deberán completar sin asistencia al menos el 90 % de las tareas principales de su rol (carga, verificación y consulta de documentos), sin requerir conocimientos especializados sobre blockchain o criptografía.

**RNF-016. Consistencia de interfaz**

El sistema deberá mantener una estructura visual y de navegación consistente entre los diferentes módulos.

**RNF-017. Retroalimentación al usuario**

El sistema deberá informar claramente al usuario sobre el resultado de las operaciones realizadas, incluyendo cargas exitosas, errores de validación, resultados de verificación y cambios de estado.

**RNF-018. Mensajes de error**

Los mensajes de error deberán ser claros y deberán indicar al usuario la causa del problema y, cuando sea posible, la acción requerida para solucionarlo.

## Mantenibilidad y arquitectura

**RNF-019. Arquitectura modular**

El sistema deberá implementar una arquitectura modular que permita separar las responsabilidades de presentación, lógica de aplicación, integración con blockchain y persistencia.

**RNF-020. Integración con blockchain**

La comunicación entre el sistema web y Hyperledger Fabric deberá realizarse mediante el backend, evitando que el frontend interactúe directamente con la infraestructura blockchain. Esta separación está contemplada en la arquitectura propuesta en el documento.

**RNF-021. Contenerización**

Los componentes de la solución deberán poder ejecutarse mediante contenedores Docker y Docker Compose, de acuerdo con la arquitectura de despliegue definida para el MVP.

**RNF-022. Escalabilidad del diseño**

La arquitectura deberá permitir la incorporación futura de nuevos módulos o funcionalidades sin requerir una modificación completa de los componentes existentes.

## Compatibilidad y restricciones

**RNF-023. Formato documental**

El sistema deberá ser compatible exclusivamente con documentos en formato PDF dentro del alcance definido para el MVP.

**RNF-024. Tamaño máximo**

El sistema deberá soportar documentos de hasta 20 MB por archivo.

**RNF-025. Compatibilidad web**

El sistema deberá ser accesible mediante navegadores web modernos que soporten las tecnologías utilizadas para el desarrollo de la aplicación.

## Auditoría y evaluación

**RNF-026. Auditabilidad**

El sistema deberá permitir reconstruir cronológicamente las acciones realizadas sobre cada documento mediante los registros de trazabilidad.

**RNF-027. Inmutabilidad del registro**

Los eventos registrados en la red blockchain deberán conservar su orden cronológico e identificador de transacción para facilitar su auditoría y consulta.

**RNF-028. Validación funcional**

El sistema deberá alcanzar como mínimo un 90 % de casos de prueba funcionales aprobados (PASS) en la suite final de pruebas definida para el MVP.

**RNF-029. Alcance de evaluación**

El rendimiento y confiabilidad del sistema deberán evaluarse bajo las condiciones controladas establecidas para el MVP, utilizando los documentos sintéticos definidos en el plan de pruebas.

**RNF-030. Seguridad basada en estándares**

El diseño del sistema deberá considerar principios y controles de seguridad relacionados con el acceso, criptografía, integridad y protección de la información, tomando como referencia los controles definidos en el Anexo A de ISO/IEC 27001:2022 contemplados en el alcance del proyecto.
