import { Link } from "react-router-dom"
import { FileCheck2, FileText, ShieldCheck } from "lucide-react"

// Diseño 2.0 (docs/Diseño 2.0.pdf, pág. 1): landing pública antes del login.
// A pedido de Sofia, a propósito NO están acá:
// - el botón "Comenzar ahora" (queda solo "Verificación simple y segura"),
// - la tarjeta flotante blanca "Integridad verificada / SHA-256 registrado".
// Degradado radial (no lineal esquina-a-esquina): azul-cian en el centro,
// verde-azulado hacia las esquinas/bordes — medido en píxeles sobre el PDF
// del diseño, no es una lectura a ojo.
const HERO_BACKGROUND =
  "radial-gradient(ellipse at center, #0f8aad 0%, #0a7f95 45%, #087b78 100%)"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-100 p-3 md:p-6">
      {/* Tarjeta flotante: mismo marco redondeado que el diseño, pero ocupando
          casi todo el alto de pantalla (el problema anterior no era la
          tarjeta en sí, era que quedaba chica y con mucho blanco debajo). */}
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-7xl flex-col overflow-hidden rounded-3xl shadow-2xl shadow-teal-900/30 md:min-h-[calc(100vh-3rem)]">
        <header className="flex items-center justify-between bg-white px-6 py-4 md:px-10">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-slate-900 text-white">
              <ShieldCheck className="size-4.5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-900">TrazaDoc</p>
              <p className="text-xs text-slate-500">Integridad documental</p>
            </div>
          </div>

          {/* Único punto de entrada al login: hover = fondo azul oscuro, letra blanca. */}
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900 ring-1 ring-slate-200 transition-colors hover:bg-slate-900 hover:text-white"
          >
            Iniciar sesión
            <span aria-hidden>→</span>
          </Link>
        </header>

        <section
          className="flex flex-1 items-center px-6 py-14 md:px-16 md:py-20"
          style={{ background: HERO_BACKGROUND }}
        >
          <div className="mx-auto grid w-full max-w-7xl items-center gap-10 md:grid-cols-2">
            <div className="space-y-6 text-white">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-50 uppercase">
                <FileCheck2 className="size-3.5" />
                Documentos confiables
              </span>

              <div className="space-y-2">
                <h1 className="text-5xl font-bold tracking-tight">TrazaDoc</h1>
                <p className="text-lg font-semibold text-cyan-50">
                  Sistema de integridad documental
                </p>
              </div>

              <p className="max-w-md text-sm leading-relaxed text-cyan-50/90">
                Protege y verifica tus documentos PDF con huellas criptográficas
                SHA-256. Consulta su autenticidad y revisa cada movimiento en un
                historial de trazabilidad claro y seguro.
              </p>

              {/* Único elemento de la fila de botones del diseño (el otro, "Comenzar
                  ahora", se excluyó a pedido de Sofia). Es informativo, no navega. */}
              <span className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-sm font-medium text-white">
                <FileText className="size-4" />
                Verificación simple y segura
              </span>
            </div>

            <div className="hidden justify-center md:flex">
              <div className="relative flex size-72 items-center justify-center rounded-3xl bg-white/90 shadow-lg">
                <FileText className="size-28 text-teal-700/30" strokeWidth={1.5} />
                <div className="absolute -right-4 -bottom-4 flex size-16 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg">
                  <ShieldCheck className="size-8" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
