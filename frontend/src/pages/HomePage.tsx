import { Link } from "react-router-dom"
import { FileCheck2, FileText, ShieldCheck } from "lucide-react"
import heroUrl from "@/assets/home-blockchain.jpg"
import { BrandLogo } from "@/components/shared/BrandLogo"

// Página pública de inicio (docs/Diseño 2.0.pdf, pág. 1). Se omiten a
// propósito el botón "Comenzar ahora" y la tarjeta "Integridad verificada".
// Degradado tomado en píxeles del PDF del diseño.
const HERO_BACKGROUND =
  "radial-gradient(ellipse at center, #0f8aad 0%, #0a7f95 45%, #087b78 100%)"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-100 p-3 md:p-6">
      {/* Tarjeta flotante que ocupa casi todo el alto de la pantalla. */}
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-7xl flex-col overflow-hidden rounded-3xl shadow-2xl shadow-teal-900/30 md:min-h-[calc(100vh-3rem)]">
        <header className="flex items-center justify-between bg-white px-6 py-4 md:px-10">
          <div className="flex items-center gap-2.5">
            <BrandLogo className="size-9 rounded-xl" />
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
            <div className="space-y-6 text-white md:pl-12">
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

              {/* Informativo: no navega. */}
              <span className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-sm font-medium text-white">
                <FileText className="size-4" />
                Verificación simple y segura
              </span>
            </div>

            <div className="hidden justify-center md:flex">
              {/* Imagen 2 de claude_docs/imgs.docx con marco blanco de 4 px. */}
              <div className="relative w-full max-w-md">
                <img
                  src={heroUrl}
                  alt="Bloques de una cadena de bloques conectados"
                  className="aspect-[1351/830] w-full rounded-3xl border-4 border-white object-cover shadow-lg"
                />
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
