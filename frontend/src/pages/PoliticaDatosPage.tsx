import * as React from "react"
import { useNavigate } from "react-router-dom"
import { FileText } from "lucide-react"
import { useSession } from "@/context/SessionContext"
import { POLICY_EFFECTIVE_DATE, POLICY_SECTIONS, POLICY_VERSION } from "@/lib/policy"
import { ROLE_HOME } from "@/lib/role-home"

const PANEL_BACKGROUND =
  "radial-gradient(ellipse at center, #0f8aad 0%, #0a7f95 45%, #087b78 100%)"

// RF-055 / HU-023: hasta aceptar la política no se habilita ninguna otra pantalla.
export default function PoliticaDatosPage() {
  const navigate = useNavigate()
  const { stage, user, policyAccepted, acceptPolicy, logout } = useSession()

  const [checked, setChecked] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (stage !== "authenticated" || !user) {
      navigate("/login", { replace: true })
    } else if (policyAccepted) {
      navigate(ROLE_HOME[user.role], { replace: true })
    }
  }, [stage, user, policyAccepted, navigate])

  if (stage !== "authenticated" || !user) return null

  async function handleAccept() {
    setIsSubmitting(true)
    const result = await acceptPolicy(POLICY_VERSION)
    setIsSubmitting(false)
    if (!result.ok) {
      setError(result.error ?? "No se pudo registrar la aceptación.")
    }
  }

  async function handleExit() {
    await logout()
    navigate("/login", { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-100 p-3 md:p-6">
      <div
        className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-7xl items-center justify-center rounded-3xl p-4 shadow-xl shadow-teal-900/15 md:min-h-[calc(100vh-3rem)] md:p-6"
        style={{ background: PANEL_BACKGROUND }}
      >
        <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-xl shadow-teal-900/20 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <FileText className="size-5" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-900">
                Política de tratamiento de datos personales
              </h1>
              <p className="text-sm text-slate-500">
                Versión {POLICY_VERSION} · vigente desde el {POLICY_EFFECTIVE_DATE}
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm text-slate-600">
            Hola, {user.name}. Antes de usar TrazaDoc necesitamos tu autorización
            para tratar tus datos personales, como lo exige la Ley 1581 de 2012.
            Lee la política y, si estás de acuerdo, acéptala para continuar.
          </p>

          <div
            className="mt-5 max-h-[45vh] space-y-4 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700"
            tabIndex={0}
            aria-label="Texto de la política de tratamiento de datos"
          >
            {POLICY_SECTIONS.map((section) => (
              <section key={section.title} className="space-y-1.5">
                <h2 className="font-semibold text-slate-900">{section.title}</h2>
                {section.paragraphs.length === 1 ? (
                  <p>{section.paragraphs[0]}</p>
                ) : (
                  <ul className="list-disc space-y-1 pl-5">
                    {section.paragraphs.map((paragraph) => (
                      <li key={paragraph}>{paragraph}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={checked}
              onChange={(event) => setChecked(event.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-[#0a7f95]"
            />
            He leído la política y autorizo el tratamiento de mis datos personales
            en los términos descritos.
          </label>

          {error && (
            <p className="mt-4 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleExit}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              Salir
            </button>
            <button
              type="button"
              disabled={!checked || isSubmitting}
              onClick={handleAccept}
              className="rounded-xl bg-[#9dc9c8] px-5 py-3 text-sm font-medium text-white transition-colors enabled:bg-[#0a7f95] enabled:hover:bg-[#087f9b] disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Guardando..." : "Aceptar y continuar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
