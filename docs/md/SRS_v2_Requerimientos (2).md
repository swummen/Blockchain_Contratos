## Requerimientos Funcionales

## 1. Autenticación y acceso

**RF-01. Selección de rol**

El sistema deberá permitir al usuario seleccionar el rol con el que desea iniciar sesión: Empleado, Verificador o Administrador.

**RF-02. Autenticación mediante credenciales**

El sistema deberá solicitar al usuario sus credenciales corporativas, compuestas por usuario y contraseña, para iniciar el proceso de autenticación.

**RF-03. Autenticación de segundo factor**

El sistema deberá enviar un token de verificación al correo corporativo registrado del usuario como segundo factor de autenticación.

**RF-04. Validación del token**

El sistema deberá validar el token ingresado por el usuario antes de concederle acceso a la plataforma.

**RF-05. Control de acceso por rol**

El sistema deberá permitir el acceso únicamente cuando las credenciales, el token y el rol seleccionado sean válidos y correspondan al usuario autenticado.

**RF-06. Redirección según rol**

El sistema deberá mostrar al usuario el panel principal y las funcionalidades correspondientes a su rol después de completar satisfactoriamente la autenticación.

**RF-07. Cierre de sesión**

El sistema deberá permitir a cualquier usuario cerrar su sesión de forma segura.

## 2. Funcionalidades del rol Empleado

**RF-08. Carga de documentos**

El sistema deberá permitir al usuario con rol Empleado cargar documentos contractuales en formato PDF para su registro y posterior verificación de integridad.

**RF-09. Restricción de formato**

El sistema deberá aceptar exclusivamente archivos con formato PDF.

**RF-10. Restricción de carga individual**

El sistema deberá permitir la carga de un único documento por operación y no deberá admitir cargas masivas o por lotes.

**RF-11. Restricción de tamaño**

El sistema deberá aceptar únicamente archivos PDF cuyo tamaño sea igual o inferior a 20 MB.

**RF-12. Validación previa de documentos**

El sistema deberá validar el formato y tamaño del archivo antes de iniciar su registro.

**RF-13. Registro del documento**

El sistema deberá registrar los metadatos asociados al documento cargado, incluyendo como mínimo su identificador, nombre, usuario responsable y fecha de registro.

**RF-14. Generación de huella criptográfica**

El sistema deberá generar automáticamente una huella criptográfica mediante el algoritmo SHA-256 a partir del contenido del documento cargado. El uso de SHA-256 se encuentra definido en el alcance técnico del proyecto.

**RF-15. Registro de la huella criptográfica**

El sistema deberá registrar la huella criptográfica generada como evidencia de integridad del documento.

**RF-16. Registro en blockchain**

El sistema deberá registrar en la red blockchain permisionada (Hyperledger Fabric) la huella criptográfica y los eventos asociados al documento, sin almacenar el archivo PDF directamente en la blockchain.

**RF-17. Confirmación de registro**

El sistema deberá informar al empleado cuando el documento haya sido registrado correctamente y su huella criptográfica haya sido generada.

**RF-18. Consulta de documentos**

El sistema deberá permitir al empleado consultar los documentos que haya registrado en la plataforma.

**RF-19. Información del documento**

El sistema deberá mostrar, como mínimo, el nombre del documento, identificador, fecha de registro y estado actual.

**RF-20. Estado del documento**

El sistema deberá mostrar para cada documento uno de los siguientes estados: Pendiente, Verificado o Alterado.

**RF-21. Consulta de trazabilidad**

El sistema deberá permitir al empleado consultar el historial de acciones asociadas a sus documentos.

**RF-22. Información de trazabilidad**

El sistema deberá mostrar en la trazabilidad el documento asociado, la acción realizada, el usuario responsable, el identificador de transacción (txID) generado en Hyperledger Fabric, y la fecha y hora del evento.

**Nota de cambio:** Se agrega el campo txID para alinear este requerimiento con RNF-27, que exige conservar el identificador de transacción como evidencia de auditoría.

## 3. Funcionalidades del rol Verificador

**RF-23. Acceso al módulo de verificación**

El sistema deberá permitir al usuario con rol Verificador acceder al módulo de verificación de integridad documental.

**RF-24. Selección del documento registrado**

El sistema deberá permitir al verificador seleccionar un documento previamente registrado en el sistema para realizar su verificación.

**RF-25. Validación de existencia**

El sistema deberá consultar mediante el identificador del documento si este se encuentra previamente registrado en el sistema.

**RF-26. Consulta de huella registrada**

El sistema deberá mostrar al verificador la huella criptográfica registrada para el documento seleccionado.

**RF-27. Restricción de visualización del hash**

La huella criptográfica completa deberá ser visible únicamente para los usuarios autorizados, de acuerdo con las reglas de acceso definidas para el rol Verificador y Administrador.

**RF-28. Carga del documento a verificar**

El sistema deberá permitir al verificador cargar el documento PDF que será comparado con la versión previamente registrada.

**RF-29. Validación del documento de comparación**

El sistema deberá verificar que el documento utilizado para la comparación cumpla con las restricciones de formato PDF y tamaño máximo de 20 MB.

**RF-30. Generación de hash del documento de comparación**

El sistema deberá generar mediante SHA-256 la huella criptográfica del documento cargado para la verificación.

**RF-31. Comparación de huellas**

El sistema deberá permitir al verificador ejecutar la comparación entre la huella criptográfica registrada y la huella generada a partir del documento cargado.

**RF-32. Resultado de la verificación**

El sistema deberá determinar automáticamente el resultado de la comparación y mostrar si la integridad del documento es confirmada o comprometida.

**RF-33. Visualización de evidencia**

El sistema deberá mostrar al verificador la huella criptográfica original y la huella criptográfica obtenida del documento actual como evidencia del resultado de la comparación.

**RF-34. Actualización del estado**

El sistema deberá actualizar automáticamente el estado del documento a Verificado cuando las huellas coincidan o a Alterado cuando las huellas sean diferentes.

**RF-35. Registro de la verificación**

El sistema deberá registrar en la trazabilidad la acción de verificación, el usuario que la realizó, la fecha y hora, el identificador de transacción (txID) generado en Hyperledger Fabric, y el resultado obtenido.

**Nota de cambio:** Se agrega el campo txID por la misma razón indicada en RF-22.

**RF-36. Nueva verificación**

El sistema deberá proporcionar una opción denominada "Nueva verificación" que permita iniciar un nuevo proceso de verificación.

**RF-37. Consulta de documentos registrados**

El sistema deberá permitir al verificador consultar los documentos registrados en el sistema.

**RF-38. Vista de documentos del verificador**

El sistema deberá mostrar al verificador, como mínimo, el nombre del documento, identificador, usuario responsable, fecha de registro, estado y huella criptográfica, de acuerdo con sus permisos de acceso.

**RF-39. Consulta de trazabilidad general**

El sistema deberá permitir al verificador consultar el historial completo de acciones registradas sobre los documentos.

**RF-40. Información de trazabilidad general**

La trazabilidad general deberá presentar como mínimo los campos Documento, Acción, Usuario, Identificador de transacción (txID), Fecha y Resultado.

**Nota de cambio:** Se agrega el campo txID; los demás campos se mantienen igual a la v1.

## 4. Funcionalidades del rol Administrador

**RF-41. Panel general**

El sistema deberá proporcionar al Administrador un panel general con información consolidada sobre el estado de los documentos registrados.

**RF-42. Resumen documental**

El panel general deberá mostrar como mínimo el número total de documentos registrados, documentos verificados, documentos pendientes y documentos alterados.

**RF-43. Consulta de usuarios**

El sistema deberá permitir al Administrador consultar los usuarios registrados en la plataforma.

**RF-44. Información de usuarios**

El sistema deberá mostrar para cada usuario, como mínimo, su identificador, nombre, rol, correo electrónico y estado (Activo / Inactivo).

**RF-45. Creación de usuarios**

El sistema deberá permitir al Administrador registrar nuevos usuarios en la plataforma.

**RF-46. Edición de usuarios**

El sistema deberá permitir al Administrador modificar el nombre, correo electrónico y rol de los usuarios registrados.

**RF-47. Desactivación de usuarios**

El sistema deberá permitir al Administrador desactivar el acceso de un usuario registrado (baja lógica), sin eliminar físicamente su información ni afectar la trazabilidad histórica asociada a sus acciones previas.

**Nota de cambio:** Requerimiento nuevo. Complementa RF-45/RF-46 y da cobertura completa al ciclo de vida de usuarios exigido por el esquema RBAC de RNF-03.

**RF-48. Consulta administrativa de documentos**

El sistema deberá permitir al Administrador consultar los documentos registrados en el sistema.

**RF-49. Vista administrativa de documentos**

El sistema deberá mostrar al Administrador, como mínimo, el nombre del documento, identificador, usuario responsable, fecha de registro, estado y huella criptográfica, respetando las restricciones de privacidad definidas para la información.

**RF-50. Consulta de trazabilidad administrativa**

El sistema deberá permitir al Administrador consultar el registro histórico de las acciones realizadas sobre los documentos.

**RF-51. Registro administrativo de trazabilidad**

El sistema deberá presentar la trazabilidad mediante una tabla que contenga, como mínimo, el identificador del documento, acción realizada, usuario responsable, identificador de transacción (txID) generado en Hyperledger Fabric, fecha y hora, y resultado obtenido.

**Nota de cambio:** Se agregan los campos txID y Resultado. Este último iguala el nivel de información que ya recibía el rol Verificador en RF-40, evitando que el panel de Administrador mostrara menos datos que un rol de menor jerarquía.

## 5. Gestión de credenciales

**RF-52. Cambio de contraseña**

El sistema deberá permitir a los usuarios autenticados cambiar su contraseña.

**RF-53. Validación de cambio de contraseña**

El sistema deberá solicitar la contraseña actual y la nueva contraseña antes de realizar el cambio, validando que la operación sea realizada por el usuario autenticado.

## Requerimientos no Funcionales

## Seguridad

**RNF-01. Protección de contraseñas**

El sistema deberá almacenar las contraseñas utilizando un mecanismo de hashing seguro con salt y no deberá almacenarlas en texto plano.

**RNF-02. Autenticación segura**

El sistema deberá implementar autenticación mediante credenciales y un segundo factor de verificación mediante token.

**Nota de cambio:** Se mantiene sin cambios respecto a la v1, sujeto a la misma validación pendiente indicada en RF-03.

**RNF-03. Control de acceso**

El sistema deberá aplicar un esquema de control de acceso basado en roles (RBAC), garantizando que cada usuario únicamente pueda acceder a las funcionalidades y datos autorizados para su rol.

**RNF-04. Protección de información sensible**

El sistema no deberá almacenar el contenido de los contratos laborales ni acuerdos de confidencialidad directamente en la red blockchain. La blockchain deberá almacenar únicamente las huellas criptográficas y los eventos necesarios para la trazabilidad. Esto corresponde directamente al modelo de persistencia definido en el proyecto.

**RNF-05. Integridad de la evidencia**

Las huellas criptográficas registradas en la blockchain deberán conservarse de manera inmutable, de forma que no puedan ser modificadas mediante las operaciones normales del sistema.

**RNF-06. Trazabilidad de operaciones**

El sistema deberá registrar las operaciones relevantes realizadas sobre los documentos, incluyendo usuario, acción, fecha, hora y resultado cuando corresponda.

**RNF-07. Protección de sesiones**

El sistema deberá gestionar las sesiones de usuario de manera segura y deberá impedir el acceso a funcionalidades protegidas una vez finalizada la sesión.

**RNF-08. Privacidad**

El sistema deberá limitar la exposición de información documental y de las huellas criptográficas de acuerdo con los permisos establecidos para cada rol.

## Rendimiento

**RNF-09. Tiempo de respuesta**

El sistema deberá responder a las operaciones principales de consulta y verificación en un tiempo adecuado para garantizar una interacción fluida con el usuario.

**RNF-10. Rendimiento de verificación**

La operación de verificación de integridad deberá cumplir como meta un percentil 95 de latencia igual o inferior a 3.000 ms en 50 peticiones consecutivas, de acuerdo con el KPI definido en el proyecto.

**RNF-11. Procesamiento criptográfico**

La generación y comparación de las huellas SHA-256 deberá realizarse de manera automática sin requerir intervención manual del usuario.

## Disponibilidad y confiabilidad

**RNF-12. Disponibilidad del sistema**

El sistema deberá permanecer disponible durante el periodo definido para las pruebas y validación del MVP.

**RNF-13. Consistencia de información**

La información registrada en la base de datos no relacional (MongoDB) y la evidencia almacenada en la red blockchain permisionada (Hyperledger Fabric) deberán mantener correspondencia respecto a los documentos, identificadores y eventos registrados.

**Nota de cambio:** Se reemplaza el término genérico "base de datos" por "base de datos no relacional (MongoDB)" y se nombra explícitamente Hyperledger Fabric, para anclar el requerimiento al marco tecnológico definido en el proyecto.

**RNF-14. Confiabilidad de la verificación**

El sistema deberá detectar las alteraciones realizadas sobre los documentos utilizados durante las pruebas de integridad. Como meta del proyecto, deberá detectar el 100 % de las alteraciones realizadas sobre los 20 documentos definidos para la validación.

## Usabilidad

**RNF-15. Facilidad de uso**

La interfaz deberá permitir que los usuarios ejecuten las operaciones correspondientes a su rol de manera clara e intuitiva, sin requerir conocimientos especializados sobre blockchain o criptografía.

**RNF-16. Consistencia de interfaz**

El sistema deberá mantener una estructura visual y de navegación consistente entre los diferentes módulos.

**RNF-17. Retroalimentación al usuario**

El sistema deberá informar claramente al usuario sobre el resultado de las operaciones realizadas, incluyendo cargas exitosas, errores de validación, resultados de verificación y cambios de estado.

**RNF-18. Mensajes de error**

Los mensajes de error deberán ser claros y deberán indicar al usuario la causa del problema y, cuando sea posible, la acción requerida para solucionarlo.

## Mantenibilidad y arquitectura

**RNF-19. Arquitectura modular**

El sistema deberá implementar una arquitectura modular que permita separar las responsabilidades de presentación, lógica de aplicación, integración con blockchain y persistencia.

**RNF-20. Integración con blockchain**

La comunicación entre el sistema web y Hyperledger Fabric deberá realizarse mediante el backend, evitando que el frontend interactúe directamente con la infraestructura blockchain. Esta separación está contemplada en la arquitectura propuesta en el documento.

**RNF-21. Contenerización**

Los componentes de la solución deberán poder ejecutarse mediante contenedores Docker y Docker Compose, de acuerdo con la arquitectura de despliegue definida para el MVP.

**RNF-22. Escalabilidad del diseño**

La arquitectura deberá permitir la incorporación futura de nuevos módulos o funcionalidades sin requerir una modificación completa de los componentes existentes.

## Compatibilidad y restricciones

**RNF-23. Formato documental**

El sistema deberá ser compatible exclusivamente con documentos en formato PDF dentro del alcance definido para el MVP.

**RNF-24. Tamaño máximo**

El sistema deberá soportar documentos de hasta 20 MB por archivo.

**RNF-25. Compatibilidad web**

El sistema deberá ser accesible mediante navegadores web modernos que soporten las tecnologías utilizadas para el desarrollo de la aplicación.

## Auditoría y evaluación

**RNF-26. Auditabilidad**

El sistema deberá permitir reconstruir cronológicamente las acciones realizadas sobre cada documento mediante los registros de trazabilidad.

**RNF-27. Inmutabilidad del registro**

Los eventos registrados en la red blockchain deberán conservar su orden cronológico e identificador de transacción para facilitar su auditoría y consulta.

**RNF-28. Validación funcional**

El sistema deberá alcanzar como mínimo un 90 % de casos de prueba funcionales aprobados (PASS) en la suite final de pruebas definida para el MVP.

**RNF-29. Alcance de evaluación**

El rendimiento y confiabilidad del sistema deberán evaluarse bajo las condiciones controladas establecidas para el MVP, utilizando los documentos sintéticos definidos en el plan de pruebas.

**RNF-30. Seguridad basada en estándares**

El diseño del sistema deberá considerar principios y controles de seguridad relacionados con el acceso, criptografía, integridad y protección de la información, tomando como referencia los controles definidos en el Anexo A de ISO/IEC 27001:2022 contemplados en el alcance del proyecto.