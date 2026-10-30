# frontend/

Aplicación web de TrazaDoc: las pantallas del Empleado, el Verificador y el Administrador. Solo se comunica con el backend por HTTP; nunca habla directamente con la blockchain ni con la base de datos.

## Tecnologías

- React 19 con TypeScript y Vite.
- Tailwind CSS v4 (plugin `@tailwindcss/vite`, sin archivo de configuración).
- Componentes de shadcn/ui sobre Radix, con íconos de lucide.
- oxlint como linter (no ESLint).
- El alias `@/` apunta a `src/`.

## Estructura

| Carpeta | Qué hay |
|---|---|
| `src/pages/` | Pantallas públicas: inicio, inicio de sesión, código de verificación, política de datos, sesión cerrada y estado del sistema |
| `src/pages/empleado/` | Cargar documento, Mis documentos y Mi trazabilidad |
| `src/pages/verificador/` | Verificar integridad, Documentos y Trazabilidad global |
| `src/pages/administrador/` | Panel, Usuarios, Documentos y Trazabilidad |
| `src/routes/` | Rutas y `ProtectedRoute`, que solo deja entrar al rol de cada sección |
| `src/context/SessionContext.tsx` | Sesión del usuario: inicio de sesión, código, política y cierre |
| `src/lib/api.ts` | Todas las llamadas al backend |
| `src/components/ui/` | Componentes base de shadcn/ui |
| `src/components/shared/` | Componentes propios: carga de archivos, huella, estados, trazabilidad, menú de usuario |

## Detalles que conviene saber

- La sesión vive solo en memoria: recargar la página cierra la sesión y una pestaña nueva no la comparte. Es intencional, para no dejar el token guardado en el navegador.
- La dirección del backend sale de `VITE_API_URL`, que Vite fija al compilar. En local, sin la variable, es `http://localhost:8080`; en Docker vale `/api` y nginx reenvía esas peticiones al backend.
- `nginx.conf` además limita los intentos de inicio de sesión por IP (10 por minuto), bloquea las rutas de diagnóstico de Fabric y agrega las cabeceras de seguridad.
- La huella SHA-256 que se ve al cargar un documento se calcula en el navegador solo para mostrarla; la que se registra la calcula el backend. El cálculo en el navegador necesita HTTPS o `localhost`.
- La versión de la política de datos (`src/lib/dataPolicy.ts`) debe coincidir con la del backend (`backend/src/config/policy.ts`).

## Comandos

Desde esta carpeta, con Node.js 22 o superior:

| Comando | Qué hace |
|---|---|
| `npm install` | Instala las dependencias |
| `npm run dev` | Servidor de desarrollo en <http://localhost:5173> (antes, detener el contenedor con `docker stop frontend`) |
| `npm run build` | Revisa los tipos (`tsc -b`) y genera la versión de producción en `dist/` |
| `npm run lint` | Ejecuta oxlint |
| `npm run preview` | Sirve la versión de producción |

Para aplicar cambios al sistema en Docker, desde la raíz del repositorio:

```bash
docker compose --env-file docker/.env -f docker/compose.app.yml up -d --build frontend
```
