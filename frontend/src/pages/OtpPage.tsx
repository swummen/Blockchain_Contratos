import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { OtpInput } from "@/components/shared/OtpInput"
import { useSession } from "@/context/SessionContext"
import { ROLE_HOME } from "@/lib/role-home"
import { Mail, RotateCcw, ShieldCheck } from "lucide-react"

const PANEL_BACKGROUND =
  "radial-gradient(ellipse at center, #0f8aad 0%, #0a7f95 45%, #087b78 100%)"

function maskEmail(email: string): string {
  const [user, domain] = email.split("@")
  if (!domain) return email
  const visible = user.slice(0, 3)
  return `${visible}${"*".repeat(Math.max(user.length - 3, 3))}@${domain}`
}

export default function OtpPage() {
  const navigate = useNavigate()
  const { stage, user, pendingEmail, policyAccepted, verifyOtp } = useSession()

  const [code, setCode] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (stage === "authenticated" && user) {
      navigate(policyAccepted ? ROLE_HOME[user.role] : "/politica-datos", { replace: true })
    } else if (stage === "anonymous") {
      navigate("/", { replace: true })
    }
  }, [stage, user, policyAccepted, navigate])

  if (!pendingEmail) return null

  async function handleVerify() {
    setIsSubmitting(true)
    const result = await verifyOtp(code)
    setIsSubmitting(false)
    if (!result.ok) {
      setError(result.error ?? "No se pudo verificar el código.")
      return
    }
    setError(null)
  }

  const complete = code.length === 6

  return (
    <div className="min-h-screen bg-slate-100 p-3 md:p-6">
      {/* Misma tarjeta flotante y ancho que inicio y login. */}
      <div
        className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-7xl items-center justify-center rounded-3xl p-6 shadow-xl shadow-teal-900/15 md:min-h-[calc(100vh-3rem)]"
        style={{ background: PANEL_BACKGROUND }}
      >
        <div className="w-full max-w-md">
          <div className="w-full animate-in rounded-3xl bg-white p-8 shadow-xl shadow-teal-900/20 duration-700 fade-in zoom-in-90 slide-in-from-bottom-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900"
            >
              <span aria-hidden>←</span>
              Volver al login
            </Link>

            {/* Difiere del Diseño 2.0 a propósito: no muestra el rol (se conoce
                solo después de validar el código) y el código es de 6 dígitos. */}
            <div className="mt-6 flex size-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <ShieldCheck className="size-6" />
            </div>

            <div className="mt-6 space-y-1.5">
              <h1 className="text-2xl font-bold text-slate-900">Verifica tu acceso</h1>
              <p className="text-sm text-slate-500">
                Ingresa el código de seis dígitos enviado a tu correo.
              </p>
            </div>

            <div className="mt-6 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <Mail className="mt-0.5 size-4 shrink-0 text-slate-400" />
              <span>
                Código enviado a{" "}
                <span className="font-medium break-all text-slate-900">
                  {maskEmail(pendingEmail)}
                </span>
              </span>
            </div>

            <div className="mt-6">
              <OtpInput value={code} onChange={setCode} />
            </div>

            {error && (
              <p className="mt-4 text-center text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <button
              type="button"
              disabled={!complete || isSubmitting}
              onClick={handleVerify}
              className="group mt-6 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#9dc9c8] py-3 text-sm font-medium text-white transition-all duration-200 enabled:bg-[#0a7f95] enabled:hover:-translate-y-1 enabled:hover:bg-[#087f9b] enabled:hover:shadow-xl enabled:hover:shadow-teal-900/35 enabled:active:scale-[0.96] disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Verificando..." : "Verificar código"}
              {!isSubmitting && (
                <span aria-hidden className="transition-transform duration-200 group-enabled:group-hover:translate-x-1.5">→</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setCode("")}
              className="mx-auto mt-4 flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900"
            >
              <RotateCcw className="size-3.5" />
              Reenviar código
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
