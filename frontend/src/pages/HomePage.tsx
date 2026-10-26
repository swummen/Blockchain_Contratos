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
        <header className="flex items-center justify-between gap-3 bg-white px-4 py-4 sm:px-6 md:px-10">
          <div className="flex min-w-0 items-center gap-2.5">
            <BrandLogo className="size-9 rounded-xl" />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold text-slate-900">TrazaDoc</p>
              <p className="truncate text-xs text-slate-500">Integridad documental</p>
            </div>
          </div>

          {/* Único punto de entrada al login: botón en relieve (btn-3d de index.css),
              blanco con letra negra; al pasar el mouse, azul oscuro con letra blanca. */}
          <Link
            to="/login"
            className="group btn-3d inline-flex h-10 shrink-0 items-center gap-1.5 bg-white px-4 text-sm whitespace-nowrap text-slate-900 ring-1 ring-slate-200 [--btn-edge:#cbd5e1] hover:bg-slate-900 hover:text-white hover:ring-slate-900 hover:[--btn-edge:#020617] sm:px-6"
          >
            Iniciar sesión
            <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1.5">→</span>
          </Link>
        </header>

        <section
          className="relative isolate flex flex-1 items-center overflow-hidden px-6 py-10 md:px-16 md:py-20"
          style={{ background: HERO_BACKGROUND }}
        >
          {/* Fondo decorativo: cuadrícula tenue (bloques conectados) que se
              desvanece hacia los bordes y tres manchas de luz que flotan lento. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="hero-grid absolute inset-0" />
            <div className="hero-glow absolute -top-24 -left-20 size-80 bg-cyan-300/30 md:size-[28rem]" />
            <div className="hero-glow hero-glow-delay absolute -right-24 -bottom-32 size-96 bg-teal-300/25 md:size-[32rem]" />
            <div className="hero-glow hero-glow-slow absolute top-1/3 left-1/2 size-64 bg-sky-400/20" />
          </div>

          <div className="mx-auto grid w-full max-w-7xl items-center gap-10 md:grid-cols-2">
            <div className="animate-in space-y-6 text-white duration-1000 fade-in slide-in-from-left-12 md:pl-12">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-50 uppercase">
                <FileCheck2 className="size-3.5" />
                Documentos confiables
              </span>

              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">TrazaDoc</h1>
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

            {/* En celular la imagen va debajo del texto, un poco más pequeña. */}
            <div className="flex justify-center px-2 md:px-0">
              {/* Imagen 2 de claude_docs/imgs.docx con marco blanco de 4 px. */}
              <div className="relative w-full max-w-sm animate-in md:max-w-md delay-200 duration-1000 fill-mode-backwards fade-in zoom-in-90">
                <img
                  src={heroUrl}
                  alt="Bloques de una cadena de bloques conectados"
                  className="aspect-[1351/830] w-full rounded-3xl border-4 border-white object-cover shadow-lg transition-all duration-500 hover:-translate-y-1 hover:scale-[1.05] hover:shadow-2xl hover:shadow-slate-900/50"
                />
                <div className="absolute -right-2 -bottom-3 flex size-12 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg md:-right-4 md:-bottom-4 md:size-16">
                  <ShieldCheck className="size-6 md:size-8" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
