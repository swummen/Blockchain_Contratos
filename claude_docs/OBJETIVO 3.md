# **OBJETIVO 3** 

# **Entregables que la propuesta exige:** 

|**Entregable**|**Qué debe contener**|**Evidencia concreta**|
|---|---|---|
|**Código fuente**<br>**del MVP**|<br>Frontend (React), backend<br>(Node.js/Express) y chaincode<br>(Go), versionados|Repositorio en GitHub con historial<br>de commits, estructura clara<br>(frontend/, backend/, chaincode/,<br>network/) y un README en la raíz|
|**Script de**<br>**despliegue de**<br>**la red**|Levantar la red de Fabric desde<br>cero: CA, orderer, peer,<br>CouchDB, canal, instalación y<br>aprobación del chaincode|docker-compose.yml, scripts<br>(network.sh o similar), archivos de<br>configuración del canal, y una guía<br>paso a paso para reproducirlo|
|**API de**<br>**integración**<br>**funcional**|Endpoints que conectan la<br>interfaz con Fabric mediante el<br>SDK, según el diseño del OE2|Documentación de la API<br>(Swagger/OpenAPI o una colección<br>de Postman) y capturas de las<br>llamadas funcionando|



# **Documentos de soporte para los KPIs** 

|**KPI**|**Meta**|**Documento que lo respalda**|
|---|---|---|
|Latencia del<br>endpoint de<br>verificación|P95 ≤ 3.000 ms en 50<br>peticiones consecutivas,<br>en Docker local (S11 y S13)|Reporte de medición: método,<br>herramienta usada, las 50 mediciones,<br>el P95 calculado y capturas. Hacerlo<br>dos veces (S11 y S13)|
|Historias de<br>usuario<br>aprobadas por<br>sprint|≥ 80 % de las<br>comprometidas al cierre de<br>cada sprint|<br>Un registro por sprint con las historias<br>comprometidas, cuáles se aprobaron y<br>el cálculo del porcentaje|



# **Documentos que recomiendo tener** 

|**Documento**|**Para qué sirve**|
|---|---|
|**Plan y registro de**<br>**sprints**|Muestra el prototipado evolutivo: objetivo de cada sprint,<br>historias, resultado y lecciones. Es la base del KPI de<br>historias aprobadas|
|**Matriz de trazabilidad**<br>**HU, RF y código**|Relaciona cada historia del backlog con el módulo o<br>endpoint que la implementa. Prepara el terreno para la<br>matriz de cumplimiento del OE4|
|**Evidencia de**<br>**integración Fabric**|Demostrar la conexión temprana con la red, que es el riesgo<br>principal que menciona la propuesta: transacción de<br>registro, consulta y txID|
|**Guía de despliegue y**<br>**configuración**|Prerrequisitos, variables de entorno, pasos para levantar<br>todo y problemas conocidos. Alimenta el manual de usuario<br>y operación del OE4|
|**Registro de cambios**<br>**respecto al diseño**|Si algo del OE2 se modificó al implementar (puertos,<br>endpoints, estructuras), anotarlo. Evita que los diagramas<br>queden desactualizados|
|**Aplicación de la**<br>**Definición de**<br>**Terminado**|Evidencia de que las historias cumplieron la definición de<br>terminado de tu backlog|



# **Dos observaciones** 

- **Cuidado con la fuente de verdad del chaincode.** Tu propuesta dice “Node.js/Go”, pero tu stack real es Go. Conviene dejar claro en el README que el chaincode es solo en Go. 

- **Las mediciones de latencia (S11 y S13) se hacen sobre Docker local.** Las pruebas del OE4 sobre Azure son otra cosa. Anota el entorno en cada reporte para que no se mezclen. 

