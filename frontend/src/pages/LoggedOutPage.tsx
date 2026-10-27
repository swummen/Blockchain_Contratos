import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { Check, LockKeyhole } from "lucide-react"
import { BrandLogo } from "@/components/shared/BrandLogo"

// Mismo degradado que login, OTP y política de datos.
const PANEL_BACKGROUND =
  "radial-gradient(ellipse at center, #0f8aad 0%, #0a7f95 45%, #087b78 100%)"

// Confirma el cierre de sesión y luego vuelve al login (HU-003 CA-01).
const REDIRECT_SECONDS = 5

export default function LoggedOutPage() {
  const navigate = useNavigate()
  const [secondsLeft, setSecondsLeft] = React.useState(REDIRECT_SECONDS)

  React.useEffect(() => {
    if (secondsLeft <= 0) {
      navigate("/login", { replace: true })
      return
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft, navigate])

  return (
    <div className="min-h-screen bg-page p-3 md:p-6">
      <div
        className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-7xl items-center justify-center rounded-3xl p-3 shadow-xl shadow-teal-900/15 sm:p-6 md:min-h-[calc(100vh-3rem)]"
        style={{ background: PANEL_BACKGROUND }}
      >
        <div className="w-full max-w-md animate-in rounded-3xl bg-white p-6 text-center shadow-xl shadow-teal-900/20 duration-700 fade-in zoom-in-95 slide-in-from-bottom-4 sm:p-8">
          <div className="flex items-center justify-center gap-2.5">
            <BrandLogo className="size-9 rounded-xl" />
            <div className="text-left leading-tight">
              <p className="text-sm font-semibold text-slate-900">TrazaDoc</p>
              <p className="text-xs text-slate-500">Integridad documental</p>
            </div>
          </div>

          {/* Candado con un check que aparece después de la tarjeta. */}
          <div className="relative mx-auto mt-8 flex size-20 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-teal-400/20 [animation-iteration-count:2]" />
            <span className="relative flex size-20 items-center justify-center rounded-full bg-teal-50 text-[#0a7f95] ring-8 ring-teal-50/60">
              <LockKeyhole className="size-9" strokeWidth={1.5} />
            </span>
            <span className="absolute -right-1 -bottom-1 flex size-8 animate-in items-center justify-center rounded-full bg-emerald-500 text-white shadow-md ring-4 ring-white delay-300 duration-500 fill-mode-backwards zoom-in-50">
              <Check className="size-4.5" strokeWidth={3} />
            </span>
          </div>

          <div className="mt-6 space-y-1.5">
            <h1 className="text-2xl font-bold text-slate-900">Sesión cerrada</h1>
            <p className="text-sm text-slate-500">
              Tu sesión se cerró de forma segura. Para volver a entrar necesitarás tu
              contraseña y un nuevo código de verificación.
            </p>
          </div>

          {/* Cuenta regresiva hacia el login. */}
          <div className="mt-6 space-y-2">
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#0a7f95] transition-[width] duration-1000 ease-linear"
                style={{ width: `${(secondsLeft / REDIRECT_SECONDS) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-400" aria-live="polite">
              Te llevaremos al inicio de sesión en {secondsLeft} s
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/login", { replace: true })}
            className="group btn-3d mt-6 flex h-12 w-full cursor-pointer items-center justify-center gap-1.5 bg-[#0a7f95] text-base text-white [--btn-edge:#065a6a]"
          >
            Volver a iniciar sesión
            <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1.5">
              →
            </span>
          </button>

          <Link
            to="/"
            replace
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900"
          >
            <span aria-hidden>←</span>
            Ir a la página de inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
