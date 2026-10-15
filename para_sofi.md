# Para Sofi — estado real del proyecto

Esto es un resumen en lenguaje llano de todo lo que lleva el proyecto "Contratos"
hasta ahora: qué funciona de verdad, qué quedó a medias, qué bugs reales
encontramos y qué falta. No es la documentación formal (esa vive en
`claude_docs/SPEC.md` y en `claude_docs/tasks/`) — esto es para que tengas el
panorama completo en un solo lugar, sin tener que ir sprint por sprint.

Última actualización: 2026-10-15 (noche), con el estado del Objetivo 3: qué
entregables ya están hechos y qué falta para cerrarlo (sección 8).

---

## 1. Qué es el proyecto, en corto

Un sistema para registrar contratos laborales en una blockchain (Hyperledger
Fabric) de forma que después se pueda verificar que un documento no fue
alterado, y llevar trazabilidad de quién hizo qué y cuándo. Tres roles:
Empleado (sube su contrato), Verificador (lo compara contra el registrado),
Administrador (gestiona usuarios y ve todo).

Arquitectura: `frontend (React)` → `backend (Node + Fabric SDK)` → `red Fabric`
→ `chaincode (Go)`. Mongo guarda metadata e índices (nombre de archivo, quién
subió qué, para armar listados); la blockchain guarda el hash y el estado real
— Mongo nunca es la fuente de verdad, la blockchain sí.

---

## 2. Qué está hecho (y probado de verdad, no solo "compila")

### Sprint 0 — Infraestructura
Red Fabric local funcionando (orderer + 2 peers + sus CAs), canal
`contratoschannel`, Mongo, backend y frontend en Docker. `docker/up.sh` levanta
todo, `docker/down.sh` lo tira abajo (con volúmenes — borra los datos).

### Sprint 1 — Identidad (`identity`)
Login en dos pasos: correo+contraseña+rol → código OTP por correo (en
desarrollo, sin SMTP configurado, el código se imprime en los logs del
backend) → se verifica el código y ahí sí se emite el token de sesión (JWT).
Sesiones reales en Mongo (se pueden invalidar de verdad con logout, no es un
JWT que vive solo). Cambio de contraseña. RBAC: cada ruta protegida exige
ciertos roles.

### Sprint 2 — Documentos + Ledger (`documents` + `ledger`)
El Empleado sube un PDF, el backend lo hashea (SHA-256) y lo registra en la
blockchain (nunca el archivo en sí, solo su hash — eso es a propósito, por
privacidad/tamaño). El chaincode en Go (`RegisterDocument`) guarda el hash y
arranca el estado en "Pendiente". Mongo guarda nombre del archivo, quién lo
subió y cuándo, para poder listar después sin tener que leer toda la cadena.

### Sprint 3 — Verificación (`verification`)
El Verificador busca un documento ya registrado (por id o eligiéndolo de un
listado — ver sección 3, esto no quedó del todo resuelto), sube un archivo
para comparar, el backend compara los hashes y llama a `RecordVerification`
en el chaincode, que cambia el estado del documento a "Verificado" o
"Alterado" según coincida o no. Quedó un panel de evidencia en el resultado
(nombre del documento registrado + nombre del archivo subido para comparar)
para que se pueda defender qué se comparó contra qué.

### Sprint 4 — Administración (`administration`) — **en progreso**
Lo que ya está (T1 a T5, backend completo):
- Trazabilidad por documento (`GET /documents/:id/events`) y trazabilidad
  general (`GET /events`, con tope de 200 eventos — ver sección 5).
- Listado de documentos acotado por rol: el Empleado solo ve los suyos, el
  Verificador/Administrador ven todos (`GET /documents`, tope de 100).
- Panel de totales para el Administrador (`GET /documents/summary`:
  cuántos pendientes/verificados/alterados).
- Gestión de usuarios real: `GET /users`, `POST /users` (alta), `PUT /users/:id`
  (editar nombre/correo/rol), `POST /users/:id/deactivate` (baja lógica, nunca
  borra). Contraseña temporal fija (`Contratos123!`) para cuenta nueva.

Lo que falta de Sprint 4 (T6 a T9, **todo frontend**): las pantallas de
"Mis documentos"/"Mi trazabilidad" del Empleado, "Documentos"/"Trazabilidad
global" del Verificador, el dashboard+documentos+trazabilidad del
Administrador, y la pantalla de "Usuarios" del Administrador — **todas estas
pantallas hoy siguen mostrando datos de mentira** (`useAppData()`, el mock
viejo), aunque el backend real que necesitan ya existe y está probado. O sea:
si entrás a "Usuarios" en el navegador ahora mismo, lo que ves ahí no es real
todavía — para crear/editar/desactivar un usuario de verdad hay que pegarle a
la API directo (o esperar a T9).

---

## 3. El problema sin resolver: el ID del documento

Este es un tema de diseño que **no está cerrado**, y vale la pena que lo
tengas claro.

**El problema de fondo:** cada documento tiene un `documentId` que es un
`crypto.randomUUID()` — algo como `3e6ea574-2edd-43d5-bfc9-b4343f4508a2`.
Es perfecto para que nunca choque con otro, pero es imposible de recordar o
transcribir a mano sin errores. Y es la única manera de referirse a "este
documento específico" tanto para el Empleado que necesita volver a verlo como
para el Verificador que necesita buscarlo para compararlo.

**Qué se intentó:**
1. Al principio, el plan original (Sprint 3) era que el Verificador pegara el
   id a mano. Vos misma probaste esto y dijiste que no te convencía — tenías
   razón, es poco práctico y nadie va a copiar un UUID de memoria.
2. Agregamos un botón de "Copiar" en la pantalla de éxito del Empleado
   cuando termina de subir su documento (`CargarDocumentoPage`), para que al
   menos no tenga que transcribirlo a mano.
3. Agregamos un listado mínimo (`GET /documents`, decisión D8 de Sprint 3)
   para que el Verificador pueda **elegir de una lista desplegable** en vez de
   pegar el id a mano. Esto ya está en `VerificarIntegridadPage`: hoy
   convive un `<Select>` con la lista de documentos y un campo de texto para
   pegar el id a mano, por si el desplegable no alcanza.

**Por qué esto sigue sin ser realmente práctico:**
- El Empleado solo ve su `documentId` **una sola vez**, en la pantalla de
  éxito justo después de subir. Si no lo copia ahí, no hay ningún otro lugar
  donde pueda volver a verlo — porque `MisDocumentosPage` (la pantalla que
  debería mostrarle su propio historial) **todavía es un mock** (Sprint 4 T6,
  pendiente). Hoy, si un Empleado cierra esa pantalla sin copiar el id, lo
  perdió. No hay manera de recuperarlo desde la interfaz.
- El desplegable del Verificador (`GET /documents`) lista los documentos por
  **nombre de archivo**, no por un identificador único y legible. Si dos
  empleados subieron archivos que se llaman igual (algo totalmente normal,
  "contrato.pdf" es un nombre común), el Verificador no tiene manera de saber
  cuál es cuál solo mirando el desplegable — tendría que adivinar o
  preguntar.
- El listado tiene un tope de 100 documentos (decisión deliberada para no
  reventar la consulta a Mongo) — en producción real, con más de 100
  documentos circulando, el desplegable empezaría a no mostrar los más
  viejos.
- No hay buscador ni filtro (por nombre, por empleado, por fecha) dentro del
  desplegable — es una lista plana.

**La solución de fondo (todavía no construida)** sería que Sprint 4 T6 le dé
al Empleado una pantalla real de "Mis documentos" donde pueda ver (y volver a
copiar) el id de cualquier documento que haya subido, en cualquier momento —
no solo en el instante en que lo sube. Eso resuelve el problema de raíz. Lo
del desplegable del Verificador con nombres ambiguos probablemente necesite,
más adelante, mostrar también el nombre del Empleado responsable y la fecha
al lado del nombre del archivo, para poder distinguir documentos con el mismo
nombre — eso todavía no está ni planeado formalmente.

### ✅ Resuelto (2026-10-12)

Todo lo de arriba ya se resolvió. Quedó así:

- **El Empleado ya puede recuperar su id cuando quiera.** "Mis documentos"
  (Sprint 4 T6) dejó de ser un mock: muestra cada documento suyo con el id
  completo y un botón "Copiar". Ya no depende de copiarlo en el único
  instante de la pantalla de carga.
- **El desplegable del Verificador ya no es una lista plana ambigua.** Ahora
  la selección es en **dos pasos** (tu idea): primero se elige a la **persona
  responsable** (por nombre), y después el **contrato** de esa persona (con
  nombre, fecha y estado). Dos "contrato.pdf" de empleados distintos ya nunca
  se confunden, porque primero se acota a una sola persona. Se probó de verdad:
  se subió un "CONTRATO FALSO.pdf" a nombre de Carlos Ruiz (mismo nombre que
  uno de María López) y el Verificador los distinguió sin problema; verificar
  el de Carlos contra su propio archivo dio "confirmada" (prueba de que apuntó
  al documento correcto y no al homónimo).
- **El panel de evidencia muestra a quién pertenece el documento elegido**
  ("Responsable · Carlos Ruiz"), para confirmar a ojo que se está verificando
  el contrato que es.
- **El UUID quedó interno:** nadie lo tiene que recordar ni teclear. El ingreso
  manual del identificador sigue existiendo como vía secundaria (colapsada),
  por si un documento no aparece en el listado.

Lo que **no** se hizo (decisiones conscientes): no se agregó un código corto
legible tipo `DOC-2026-0042` (el selector por persona lo hizo innecesario por
ahora; se puede agregar después si hace falta), y no se agregó una función de
"solicitar verificación" (el Verificador puede verificar cualquier contrato
cuando quiera). El tope de 100 del listado y la falta de buscador/paginación
siguen pendientes para cuando haya volumen real (es el alcance completo de
RF‑37…40).

Trazabilidad: `claude_docs/SPEC.md` RF‑24 (nota de cambio Sprint 4),
`claude_docs/tasks/plan-id-seleccion.md` y `todo-id-seleccion.md`.

---

## 4. El bug que viste: cambiar el rol de un usuario "a veces" lo deja entrar y a veces no

Esto tiene una explicación concreta — no es al azar, aunque desde afuera lo
parezca. Hay **dos mecanismos distintos** metidos en el mismo síntoma:

### Mecanismo 1: el selector de rol del login no sabe cuál es tu rol actual

Mirá la pantalla de login (`frontend/src/pages/LoginPage.tsx`): tiene una
pestaña para elegir "Empleado / Verificador / Administrador" **antes** de
poner correo y contraseña. Esa pestaña siempre arranca en "Empleado" por
default, sin importar cuál sea el rol real de la cuenta.

Cuando el backend valida el código OTP (`verifyOtp` en
`backend/src/services/authService.ts`, línea ~150), compara el rol que
elegiste en esa pestaña contra el rol que la cuenta tiene **en ese momento**
en Mongo. Si no coinciden exactamente, te rechaza con "El rol seleccionado no
coincide con tu cuenta" (403) — aunque el correo y la contraseña estén
perfectos.

Entonces: si el Administrador le cambia el rol a alguien (pongamos, de
Empleado a Verificador) y esa persona va a loguearse de nuevo sin saber que
le cambiaron el rol, lo más probable es que siga clickeando la pestaña
"Empleado" de toda la vida (es literalmente el default) — y el sistema lo va
a rechazar, porque su cuenta ya es "Verificador" en Mongo. Para esa persona,
desde afuera, se ve exactamente como "a veces me deja entrar, a veces no": en
realidad, le deja entrar **solo si elige la pestaña que coincide con su rol
actual**, y nada en la pantalla le avisa cuál es.

### Mecanismo 2: una sesión ya abierta no se entera de que el rol cambió

Este es un poco más sutil. El token de sesión (JWT) que recibís al loguearte
tiene el rol **grabado adentro, en el momento del login** — no es algo que
se vuelva a consultar en cada click. El middleware que protege las rutas
(`requireAuth`, en `backend/src/middlewares/auth.ts`) solo verifica que la
sesión siga existiendo en Mongo; **nunca vuelve a leer cuál es el rol actual
del usuario**. Está comentado así a propósito desde Sprint 1 — se decidió que
el rol que manda es el que quedó firmado en el token, no el que haya en la
base en ese instante.

Esto significa que si alguien ya tenía una sesión abierta (logueado desde
antes) y el Administrador le cambia el rol mientras esa sesión sigue viva, esa
persona **sigue viendo y pudiendo hacer todo lo que podía hacer con el rol
viejo**, durante hasta una hora (el tiempo de vida del token), hasta que el
token expire o haga logout y vuelva a entrar. El cambio de rol no tiene
ningún efecto inmediato sobre una sesión que ya estaba abierta.

(Dato relacionado: en Sprint 4 T5 sí arreglamos este mismo problema pero para
la **desactivación** de un usuario — ahora, cuando el Administrador desactiva
a alguien, se le cortan todas sus sesiones abiertas al instante, no solo se le
bloquean los logins futuros. Ese arreglo **no se aplicó al cambio de rol** —
sigue pendiente, es la misma clase de problema pero todavía sin resolver ahí.)

### Resumiendo el síntoma que viste

- Si la persona tiene una sesión vieja abierta → sigue entrando y viendo todo
  con el **rol viejo**, como si nada hubiera cambiado (hasta que expire o
  haga logout).
- Si la persona cierra sesión y vuelve a entrar eligiendo la pestaña del rol
  **viejo** (la que está acostumbrada a usar, o el default) → la rechaza con
  403.
- Si la persona cierra sesión y vuelve a entrar eligiendo la pestaña del rol
  **nuevo** (el correcto, el que el Administrador le puso ahora) → entra bien,
  sin problema.

No es al azar: depende de qué pestaña se elige y de si había o no una sesión
vieja todavía viva. Pero para alguien que no sabe esto, se siente
completamente impredecible.

**Qué se podría hacer (todavía no implementado, ninguna de las dos):**
1. Que al cambiar el rol de un usuario desde `PUT /users/:id`, se le corten
   también las sesiones abiertas (mismo arreglo que ya existe para
   desactivar, aplicado también aquí).
2. Que el login no te obligue a adivinar tu rol — por ejemplo, que alcance
   con correo+contraseña, y que el backend determine el rol solo, en vez de
   pedirlo como un dato que el usuario tiene que acertar.

---

## 5. Errores reales que encontramos (no teóricos — bugs de verdad, ya corregidos)

Esto es una bitácora de los bugs genuinos que fuimos encontrando, la mayoría
gracias a probar en vivo contra el stack real (nunca alcanzó con solo leer el
código) o gracias a una revisión de código adversarial:

- **Clasificación 404 vs 502 mal armada** (Sprint 3): el código que decidía
  si un documento "no existe" o si "hubo un error de red" miraba si el texto
  del error contenía la frase "not found" en cualquier lado — lo cual podía
  confundir un error de transporte real con un simple "documento no
  encontrado". Se corrigió exigiendo que el error tuviera detalles reales del
  peer antes de clasificarlo como 404.
- **Chequeo de dueño del documento dependía de Mongo, no de la blockchain**
  (Sprint 4 T3): si Mongo se desincronizaba de la blockchain (puede pasar),
  un Empleado dueño real de su documento podía quedar bloqueado para ver su
  propia trazabilidad. Se corrigió leyendo el dueño directo del evento
  "registro" en la blockchain (que nunca puede estar desincronizado de sí
  misma), en vez de confiar en la copia de Mongo.
- **El header de CORS de `/documents` llevaba 2 sprints desactualizado**
  (Sprint 4 T4): decía que solo se permitía `POST`, cuando Sprint 3 ya había
  agregado rutas `GET` ahí mismo. En la práctica nunca bloqueó nada (`GET` es
  un método que los navegadores dejan pasar aunque no esté listado), pero si
  algún día se agrega `PUT`/`DELETE` sin acordarse de actualizar esto, ahí sí
  se bloquearía de verdad. Se corrigió el header y se documentó el riesgo
  real (no el que yo pensé al principio — me equivoqué primero diciendo que
  "ya lo había confirmado con curl", lo cual es falso, curl no aplica
  políticas de CORS; quedó corregido en el comentario).
- **Consulta de "todos los eventos" sin límite** (Sprint 4 T4): `GET /events`
  no tenía ningún tope — como los eventos de la blockchain crecen para
  siempre (nunca se borran), esto iba a volverse cada vez más pesado. Se le
  puso un tope de 200 eventos más recientes.
- **El `.env` del backend nunca se cargaba** (encontrado cerrando Sprint 3):
  un bug viejo, sin relación con lo que se estaba haciendo en ese momento —
  `npm run dev` y `npm run seed` nunca leían el archivo `.env` porque faltaba
  la bandera para que Node lo cargue. Se corrigió.
- **Desactivar a un usuario no le cortaba la sesión ya abierta** (Sprint 4
  T5, encontrado por la revisión de código): si alguien ya estaba logueado,
  seguía con acceso completo hasta que su token expirara solo (hasta una
  hora), aunque el Administrador ya lo hubiera desactivado. Se corrigió para
  que desactivar corte las sesiones al instante — **este es justo el mismo
  tipo de problema que describo en la sección 4 para el cambio de rol, pero
  ahí todavía no está corregido**.
- **La respuesta de crear/editar usuario podía mostrar el correo con otra
  mayúscula/minúscula que la guardada** (Sprint 4 T5): si el Administrador
  tipeaba `Foo@Bar.COM`, Mongo guardaba `foo@bar.com` pero la respuesta
  mostraba la versión tal cual se escribió. Se corrigió para que ambas
  coincidan siempre.
- **El `smoke-test.sh` tenía un falso positivo**: un comentario de código
  escrito en minúscula ("fabric") hacía disparar sin querer un chequeo que
  busca que el frontend no mencione infraestructura directamente. Se corrigió
  el texto del comentario (no el chequeo, que está bien como está).

---

## 6. Qué falta (lo que ya sabemos que sigue pendiente)

- ~~**Sprint 4, T6 a T9 (todo frontend)**~~ → **Hecho (2026-10-12).** Las
  pantallas de los 3 roles ya usan el backend real; ninguna muestra datos de
  mentira. Falta solo el cierre de documentación del sprint (T10).
- ~~**El problema del ID del documento**~~ → **Resuelto (2026-10-12),** ver el
  bloque "✅ Resuelto" al final de la sección 3: selección en dos pasos
  (persona → contrato) + "Mis documentos" real + panel con responsable.
- ~~**El cambio de rol no corta sesiones abiertas**~~ → **Resuelto (2026-10-12):**
  cambiar el rol de un usuario ahora corta sus sesiones abiertas al instante
  (mismo arreglo que la desactivación), y el Administrador no puede quitarse su
  propio rol.
- ~~**El selector de rol en el login no sabe cuál es tu rol real**~~ →
  **Resuelto:** el login ya no pide el rol (cambio de la rama de Laura); el
  backend lo determina solo contra la cuenta.
- ~~**Pendiente de verificar en navegador por vos**~~ → **Hecho (2026-10-14):**
  lo probaste y todo funciona; Sprint 4 quedó cerrado (T10).
- **El tope de 100 del listado y la falta de buscador/paginación** siguen
  pendientes para cuando haya volumen real (alcance completo de RF‑37…40).
- **RNF-10 y RNF-14** (benchmarks formales de performance): están marcados
  como "parcial" en el SPEC — son mediciones que todavía no se corrieron
  formalmente, no features sin construir.
- Ningún flujo de invitación por correo para usuarios nuevos (se usa una
  contraseña temporal fija y documentada en su lugar — decisión deliberada
  para el alcance de esta tesis, no un hueco sin avisar).
- No hay reactivación de un usuario desactivado (decisión deliberada,
  ningún requerimiento la pide) — si hiciera falta, hoy se resuelve editando
  la base a mano.

- **Hola soy yo**
para decirte que tambien quitar lo de selcción de rol, las 2 pantalls faltantes, la de inicio y la de sesion cerrada con exito y eso de que no deberia poder subir el mismo archivo o contrato si aun sigue pendiente, solo se debe subir si ya se verificó.
la inactividad e intentos de inicio de sesion hay que revisarlo.
POR FAVOR MURAR COMO HACEMOS LO DEL ID QUE SEA MÁS SENCILO PARA EL USUARIO Y ESO AJAJJA.

> **Respuesta (2026-10-15):** todo lo de esta nota quedó hecho — el login ya no
> pide el rol, existen las pantallas de inicio y de sesión cerrada, no se puede
> volver a subir un archivo mientras siga Pendiente (`409`), el cierre por
> inactividad (15 min) y el bloqueo tras 5 intentos (15 min) funcionan (los
> revisaste en navegador), y lo del ID quedó en la selección en dos pasos
> (persona → contrato, sección 3).

Lo que sigue pendiente, en orden: `claude_docs/tasks/plan-trabajo-pendiente.md`.

---

## 7. Cómo configurarle el proyecto a Laura (correo de verificación con Brevo)

> **Actualizado (2026-10-15):** la guía completa para cualquier computador está en
> [`INSTALACION.md`](INSTALACION.md). Cambio importante: ya **no hace falta**
> `backend/.env` ni `npm run seed` — `bash docker/up.sh` crea los usuarios solo, leyendo
> `SEED_EMAIL` de `docker/.env`. Lo único que Laura necesita es su `docker/.env` (con su
> clave SMTP y `SEED_EMAIL`) y seguir la guía.

El código de verificación (OTP) sale por **Brevo** desde
`contratosblockchain@gmail.com`. La configuración vive en dos archivos `.env`
que **no se suben a git**, así que cuando Laura clone o actualice el repo no
los tiene: hay que crearlos en su computador. Pasos:

### Lo que haces tú (Sofia), una sola vez

1. Entra a Brevo → ⚙️ → **SMTP & API** → pestaña **SMTP** →
   **Generar nueva clave SMTP**: nombre `laura-local`, variante **Estándar**,
   vencimiento 1 año. Copia la clave en ese momento (no se vuelve a mostrar).
2. Pásale a Laura **por un medio privado** (WhatsApp, en persona — nunca por
   el repo ni por un chat compartido):
   - la clave SMTP `laura-local`,
   - el **login SMTP** de la cuenta (el `xxxx@smtp-brevo.com` que aparece en esa
     misma pestaña — no es un correo de verdad, es el usuario de Brevo),
   - la contraseña de `contratosblockchain@gmail.com`, para que pueda leer los
     códigos que llegan ahí.

   Cada una con su propia clave: si una se filtra, se borra solo esa en Brevo y
   la otra sigue funcionando.

### Lo que hace Laura en su computador

1. Actualizar el repo (`git pull`).
2. **Si ya tenía levantada la red de un clon anterior**, borrar esos restos
   antes de nada (ver "Después de re-clonar el repo" en `docker/README.md`).
3. Crear `docker/.env` desde el ejemplo y completar el bloque de correo:

   ```bash
   cp docker/.env.example docker/.env
   ```

   ```
   SMTP_HOST=smtp-relay.sendinblue.com
   SMTP_PORT=587
   SMTP_USER=<login SMTP de Brevo, el xxxx@smtp-brevo.com>
   SMTP_PASSWORD=<su clave laura-local>
   SMTP_FROM=contratosblockchain@gmail.com
   ```

   Ojo: `SMTP_HOST` es `smtp-relay.sendinblue.com`, **no** el
   `smtp-relay.brevo.com` que muestra Brevo — con ese, desde Colombia, la
   conexión falla por un error de certificado.
4. Crear `backend/.env` desde el ejemplo y ajustar dos líneas:

   ```bash
   cp backend/.env.example backend/.env
   ```

   ```
   MONGO_URI=mongodb://root:changeme@localhost:27017/?authSource=admin
   SEED_EMAIL=contratosblockchain@gmail.com
   ```

5. Levantar todo y sembrar los usuarios:

   ```bash
   bash docker/up.sh
   cd backend && npm install && npm run seed
   ```

   El seed tiene que mostrar los 4 usuarios como
   `contratosblockchain+empleado@gmail.com`, `+empleado2@`, `+verificador@` y
   `+admin@`.
6. Probar: entrar en <http://localhost:5173> con
   `contratosblockchain+empleado@gmail.com` / `Contratos123!` → el código llega
   a `contratosblockchain@gmail.com` (la primera vez, revisar **spam** y marcar
   "No es spam").

### Si algo falla

- **El código no llega y aparece en `docker logs backend`** → `docker/.env` no
  tiene `SMTP_HOST` (o se levantó el stack antes de crearlo): completar y
  correr `bash docker/up.sh` de nuevo.
- **Al iniciar sesión sale "No se pudo enviar el código de verificación"** →
  la clave o el login SMTP están mal copiados (el detalle real queda en
  `docker logs backend`), o la clave venció (vence al año, **o a los 90
  días sin usarse**). Generar otra en Brevo.
- **Los usuarios del seed salen como `@empresa.com`** → falta `SEED_EMAIL` en
  `backend/.env`. Agregarlo y repetir `bash docker/down.sh && bash docker/up.sh`
  y `npm run seed`.
- **Si las dos prueban a la vez con el mismo rol**, llegan dos códigos al mismo
  buzón casi juntos: usar el más reciente.

---

## 8. Objetivo 3 (OE3): qué ya está hecho y qué falta

El Objetivo 3 es **desarrollar el MVP integrado con Hyperledger Fabric**. Lo que
exige y recomienda está en `claude_docs/OBJETIVO 3.md`. Este es el estado al
2026-10-15.

### ✅ Ya está hecho

| Entregable | Dónde quedó | Qué contiene |
|---|---|---|
| **Código fuente del MVP** | El repositorio (`frontend/`, `backend/`, `chaincode/`, `docker/`) + [`README.md`](README.md) | Las 3 partes funcionando de punta a punta; el README dice claramente que el chaincode es **solo en Go**. |
| **Script de despliegue de la red** | `docker/up.sh` (+ `stop.sh`, `start.sh`, `down.sh`) | Un solo comando levanta la red Fabric, instala el chaincode, arranca Mongo/backend/frontend y crea los usuarios de prueba. |
| **Guía de despliegue y configuración** | [`INSTALACION.md`](INSTALACION.md) | Desde cero: programas a instalar (con `winget`), configuración, encender/apagar, usuarios, 17 problemas frecuentes y de dónde sale la configuración del canal (`configtx.yaml`). |
| **API de integración (documentación)** | [`docs/api/openapi.yaml`](docs/api/openapi.yaml) + [`docs/api/README.md`](docs/api/README.md) | Los 18 endpoints en formato Swagger/OpenAPI, validado y comparado contra el backend real. Se importa directo en Postman. |
| **Evidencia de integración con Fabric** | [`docs/evidencias/integracion-fabric.md`](docs/evidencias/integracion-fabric.md) | Registro, consulta y dos verificaciones reales; los TxID ubicados en los bloques 9, 10 y 11 del ledger, firmados por las 2 organizaciones. Con scripts para repetirla. |
| **Registro de sprints** (y base del KPI de HU aprobadas) | [`docs/registro-sprints.md`](docs/registro-sprints.md) | Fechas, HU comprometidas, puntos, Definición de Terminado y lecciones de cada sprint. **21 de 21 HU terminadas técnicamente (100 %)**. |
| **Matriz de trazabilidad HU ↔ RF ↔ código** | [`docs/Matriz_Trazabilidad_HU_RF_Codigo.xlsx`](docs/Matriz_Trazabilidad_HU_RF_Codigo.xlsx) | Las 24 HU y los 55 RF con su pantalla, endpoint, función del backend, función del chaincode y pruebas. **53 de 55 RF implementados.** |
| **Registro de cambios respecto al diseño** | [`docs/uml/README.md`](docs/uml/README.md) + hoja "Observaciones" de [`docs/Matriz_Infraestructura.xlsx`](docs/Matriz_Infraestructura.xlsx) | 13 cambios entre lo diseñado y lo implementado (LevelDB en vez de CouchDB, 2 organizaciones, Brevo, selección en dos pasos, etc.). Los 8 diagramas UML ya reflejan el código real. |
| **Script de medición de latencia** | [`tests/perf/latencia-verificacion.mjs`](tests/perf/latencia-verificacion.mjs) + [`tests/perf/README.md`](tests/perf/README.md) | Hace las 50 verificaciones y genera el reporte que pide el KPI (método, entorno, las 50 mediciones, P95). **Corrida de prueba: P95 = 2040 ms → PASS** (meta ≤ 3000 ms). |
| **Las 2 observaciones del documento** | README y reporte de latencia | "El chaincode es solo Go": dicho en el README. "Anotar el entorno en cada medición": el reporte de latencia lo escribe solo (Docker local, equipo, versiones). |

### ⏳ Lo que falta (todo les toca a ustedes)

| # | Qué falta | Para qué entregable | Cómo hacerlo |
|---|---|---|---|
| 1 | **Confirmar las fechas de las semanas S11 y S13** | KPI de latencia | Mirar el cronograma (Tabla 5 del trabajo de grado). Es una imagen, por eso no se pudo leer automáticamente. |
| 2 | **Las 2 mediciones oficiales de latencia** (una en S11 y otra en S13) | KPI de latencia | Seguir [`tests/perf/README.md`](tests/perf/README.md): subir un PDF **realista (1-5 MB)** como Empleado, correr el script, **tomar captura** y hacer commit del reporte que genera. |
| 3 | **Capturas de las llamadas a la API funcionando** | API de integración | En Postman, con la lista de **11 capturas sugeridas** de [`docs/api/README.md`](docs/api/README.md) (registro, verificación confirmada y alterada, 403 por rol, etc.). |
| 4 | **Aprobación del tutor de cada sprint** (criterio 5 de la Definición de Terminado) | KPI de HU aprobadas | Registrar la fecha de la sesión de revisión en la última columna de [`docs/registro-sprints.md`](docs/registro-sprints.md). **Sin esto no hay porcentaje oficial**, aunque todo esté terminado. |
| 5 | **Pull requests de revisión** (criterio 1) | Definición de Terminado | Abrir los PR que faltan o dejar escrita la excepción por sprint (hoy solo el frontend de Laura entró por PR). |
| 6 | **Decidir la observación OBS-01** (política de endorsement) | Registro de cambios | La red exige la firma de **las 2 organizaciones** (MAJORITY), pero los planes de Sprint 0 y 2 dicen que bastaba una ("OR"). Recomendado: dejar MAJORITY (ya está probado y es más seguro) y que Claude corrija los planes. |

### Opcional pero recomendable

- Una **captura de la evidencia de Fabric** (el documento con sus TxID en la
  aplicación) para la tesis: la evidencia escrita ya está, la captura la refuerza.
- Antes de cualquier demo: `bash docker/down.sh && bash docker/up.sh` para tener
  el sistema limpio (los usuarios de prueba se crean solos).
- **Cambiar la clave SMTP de Brevo** (la actual quedó escrita en el chat) y
  generarle la suya a Laura (sección 7).

**En una frase:** todo lo que se podía construir y documentar del Objetivo 3 ya
está; lo que falta son **fechas, capturas, mediciones oficiales y la aprobación
del tutor**.
