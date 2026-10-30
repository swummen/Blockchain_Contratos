import * as React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowDown, ShieldCheck } from "lucide-react"
import { BrandLogo } from "@/components/shared/BrandLogo"
import { useSession } from "@/context/SessionContext"
import { POLICY_DATE, POLICY_SECTIONS, POLICY_VERSION } from "@/lib/dataPolicy"
import { ROLE_HOME } from "@/lib/roles"

// Mismo degradado que login y OTP.
const PANEL_BACKGROUND =
  "radial-gradient(ellipse at center, #0f8aad 0%, #0a7f95 45%, #087b78 100%)"

// RF-055 / HU-023: tras el OTP, si el usuario no ha aceptado la versión vigente.
// CA-01: no se habilita nada más hasta aceptarla (ProtectedRoute la exige y el
// backend responde 403 en las demás rutas). CA-02: al aceptar se registra
// usuario, fecha y hora y versión, y se abre el panel.
export default function PolicyPage() {
  const navigate = useNavigate()
  const { stage, user, acceptPolicy, logout } = useSession()

  // Autorización informada (Ley 1581, art. 9): la casilla se habilita después
  // de llegar al final del texto.
  const [readToEnd, setReadToEnd] = React.useState(false)
  const [checked, setChecked] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (stage !== "authenticated" || !user) {
      navigate("/login", { replace: true })
    } else if (user.policyAccepted !== false) {
      navigate(ROLE_HOME[user.role], { replace: true })
    }
  }, [stage, user, navigate])

  const checkReadToEnd = React.useCallback(() => {
    const el = scrollRef.current
    if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 24) {
      setReadToEnd(true)
    }
  }, [])

  // Si el texto cabe completo sin desplazarse (pantallas altas), ya está leído.
  React.useEffect(() => {
    checkReadToEnd()
  }, [checkReadToEnd])

  if (stage !== "authenticated" || !user || user.policyAccepted !== false) return null

  async function handleAccept() {
    setIsSubmitting(true)
    const result = await acceptPolicy(POLICY_VERSION)
    setIsSubmitting(false)
    // Si sale bien, el efecto de arriba lleva al panel del rol.
    if (!result.ok) setError(result.error ?? "No se pudo registrar la aceptación.")
  }

  async function handleReject() {
    await logout()
    navigate("/sesion-cerrada", { replace: true })
  }

  const firstName = user.name.split(" ")[0]

  return (
    <div className="min-h-screen bg-page p-3 md:p-6">
      <div
        className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-7xl items-center justify-center rounded-3xl p-3 shadow-xl shadow-teal-900/15 sm:p-6 md:min-h-[calc(100vh-3rem)]"
        style={{ background: PANEL_BACKGROUND }}
      >
        <div className="flex w-full max-w-2xl animate-in flex-col rounded-3xl bg-white shadow-xl shadow-teal-900/20 duration-700 fade-in zoom-in-95 slide-in-from-bottom-4">
          <header className="flex items-start gap-3 border-b border-slate-100 p-5 sm:p-8 sm:pb-6">
            <BrandLogo className="size-11 shrink-0 rounded-2xl" />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-xs font-semibold tracking-wide text-[#087f9b] uppercase">
                Antes de continuar
              </p>
              <h1 className="text-xl leading-tight font-bold text-slate-900 sm:text-2xl">
                Política de tratamiento de datos personales
              </h1>
              <p className="text-sm text-slate-500">
                Hola, {firstName}. Lee la política y acéptala para entrar a tu panel.
              </p>
            </div>
          </header>

          <div className="relative">
            <div
              ref={scrollRef}
              onScroll={checkReadToEnd}
              tabIndex={0}
              aria-label="Texto de la política de tratamiento de datos"
              className="max-h-[45vh] space-y-5 overflow-y-auto px-5 py-5 text-sm leading-relaxed text-slate-600 outline-none focus-visible:ring-3 focus-visible:ring-[#087f9b]/20 sm:max-h-[50vh] sm:px-8"
            >
              <p className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                Versión {POLICY_VERSION} · vigente desde el mes de {POLICY_DATE}
              </p>
              {POLICY_SECTIONS.map((section) => (
                <section key={section.title} className="space-y-2">
                  <h2 className="text-sm font-semibold text-slate-900">{section.title}</h2>
                  {section.paragraphs?.map((p) => <p key={p}>{p}</p>)}
                  {section.items && (
                    <ul className="list-disc space-y-1 pl-5 marker:text-[#0a7f95]">
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {section.notes?.map((p) => <p key={p}>{p}</p>)}
                </section>
              ))}
            </div>

            {/* Indicador para seguir leyendo; desaparece al llegar al final. */}
            {!readToEnd && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-16 items-end justify-center bg-gradient-to-t from-white to-transparent pb-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-medium text-white">
                  <ArrowDown className="size-3.5 animate-bounce" />
                  Desplázate hasta el final
                </span>
              </div>
            )}
          </div>

          <footer className="space-y-4 border-t border-slate-100 p-5 sm:p-8 sm:pt-6">
            <label
              className={`flex items-start gap-3 rounded-xl border p-3.5 text-sm transition-colors ${
                readToEnd
                  ? "cursor-pointer border-slate-200 text-slate-700 hover:border-[#087f9b]/40 hover:bg-slate-50"
                  : "cursor-not-allowed border-slate-100 text-slate-400"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={!readToEnd}
                onChange={(e) => setChecked(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[#0a7f95] disabled:cursor-not-allowed"
              />
              <span>
                He leído la política de tratamiento de datos personales y autorizo el tratamiento de mis datos para las finalidades descritas.
              </span>
            </label>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handleReject}
                className="cursor-pointer text-sm text-slate-500 transition-colors hover:text-slate-900"
              >
                Rechazar y salir
              </button>
              <button
                type="button"
                onClick={handleAccept}
                disabled={!checked || isSubmitting}
                className="group btn-3d flex h-12 w-full cursor-pointer items-center justify-center gap-2 bg-[#9dc9c8] px-8 text-base text-white [--btn-edge:#7fb1b0] enabled:bg-[#0a7f95] enabled:[--btn-edge:#065a6a] disabled:cursor-not-allowed sm:w-auto"
              >
                <ShieldCheck className="size-4.5" />
                {isSubmitting ? "Registrando..." : "Aceptar y continuar"}
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
