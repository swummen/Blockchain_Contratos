import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { OtpInput } from "@/components/shared/OtpInput"
import { useSession } from "@/context/SessionContext"
import { Mail, RotateCcw, ShieldCheck } from "lucide-react"

const PANEL_BACKGROUND =
  "radial-gradient(ellipse at center, #0f8aad 0%, #0a7f95 45%, #087b78 100%)"

function maskEmail(email: string): string {
  const [user, domain] = email.split("@")
  if (!domain) return email
  const visible = user.slice(0, 3)
  return `${visible}${"*".repeat(Math.max(user.length - 3, 3))}@${domain}`
}

const ROLE_HOME: Record<string, string> = {
  Empleado: "/empleado",
  Verificador: "/verificador",
  Administrador: "/administrador",
}

export default function OtpPage() {
  const navigate = useNavigate()
  const { stage, user, pendingEmail, verifyOtp } = useSession()

  const [code, setCode] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (stage === "authenticated" && user) {
      navigate(ROLE_HOME[user.role], { replace: true })
    } else if (stage === "anonymous") {
      navigate("/", { replace: true })
    }
  }, [stage, user, navigate])

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
      {/* Misma tarjeta flotante que inicio/login, con el mismo ancho que esas
          dos (max-w-7xl): el degradado azul vive adentro del marco
          redondeado, la página en general es blanco/gris. */}
      <div
        className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-7xl items-center justify-center rounded-3xl p-6 shadow-xl shadow-teal-900/15 md:min-h-[calc(100vh-3rem)]"
        style={{ background: PANEL_BACKGROUND }}
      >
        <div className="w-full max-w-md">
          <div className="w-full rounded-3xl bg-white p-8 shadow-xl shadow-teal-900/20">
            {/* "Volver al login" adentro de la tarjeta blanca, igual que en
                LoginPage (ahí también vive dentro del panel de contenido, no
                en el panel decorativo). */}
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900"
            >
              <span aria-hidden>←</span>
              Volver al login
            </Link>

            {/* Diseño 2.0 muestra acá un badge con el rol (p. ej. "Empleado") y
                dice "código de cuatro dígitos". No agregué ninguna de las dos
                cosas: el rol recién se conoce después de verificar el código
                (se eliminó de pedido previo, por seguridad — no debe
                filtrarse antes), y el código real que emite el backend es de
                6 dígitos, no 4. Avisame si querés que resolvamos esto
                distinto. */}
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
              className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#9dc9c8] py-3 text-sm font-medium text-white transition-colors enabled:bg-[#0a7f95] enabled:hover:bg-[#087f9b] disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Verificando..." : "Verificar código"}
              {!isSubmitting && <span aria-hidden>→</span>}
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
