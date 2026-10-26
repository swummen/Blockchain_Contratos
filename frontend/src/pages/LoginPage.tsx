import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { useSession } from "@/context/SessionContext"
import { Eye, EyeOff, FileCheck2, Lock, User } from "lucide-react"
import { BrandLogo } from "@/components/shared/BrandLogo"

// Mismo degradado que HomePage.
const PANEL_BACKGROUND =
  "radial-gradient(ellipse at center, #0f8aad 0%, #0a7f95 45%, #087b78 100%)"

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useSession()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    const result = await login(email, password)
    setIsSubmitting(false)
    if (!result.ok) {
      setError(result.error ?? "No se pudo iniciar sesión.")
      return
    }
    setError(null)
    navigate("/verificacion")
  }

  return (
    <div className="min-h-screen bg-slate-100 p-3 md:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-7xl flex-col overflow-hidden rounded-3xl shadow-xl shadow-teal-900/15 md:min-h-[calc(100vh-3rem)] md:flex-row">
        {/* Solo en celular: franja con la marca, en lugar del panel izquierdo. */}
        <div
          className="flex items-center gap-2.5 px-6 py-4 text-white md:hidden"
          style={{ background: PANEL_BACKGROUND }}
        >
          <BrandLogo className="size-9 rounded-xl" />
          <div className="leading-tight">
            <p className="text-sm font-semibold">TrazaDoc</p>
            <p className="text-xs text-cyan-50/80">Integridad documental</p>
          </div>
        </div>

        {/* Panel izquierdo: decorativo, oculto en mobile. */}
        <div
          className="hidden flex-col justify-between p-10 text-white md:flex md:w-[42%]"
          style={{ background: PANEL_BACKGROUND }}
        >
          <div className="flex items-center gap-2.5">
            <BrandLogo className="size-9 rounded-xl" />
            <div className="leading-tight">
              <p className="text-sm font-semibold">TrazaDoc</p>
              <p className="text-xs text-cyan-50/80">Integridad documental</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-white text-teal-700">
              <FileCheck2 className="size-7" />
            </div>
            <h2 className="text-3xl leading-tight font-bold">
              Tus documentos, protegidos en cada paso.
            </h2>
            <p className="max-w-xs text-sm leading-relaxed text-cyan-50/90">
              Accede para cargar, verificar y consultar la trazabilidad de tus
              documentos con seguridad criptográfica.
            </p>
          </div>

          <div aria-hidden className="h-4" />
        </div>

        {/* Panel derecho: formulario. */}
        <div className="flex flex-1 flex-col justify-center bg-white px-6 py-8 md:px-16 md:py-10">
          <div className="mx-auto w-full max-w-sm animate-in space-y-8 duration-700 fade-in slide-in-from-bottom-8">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900"
            >
              <span aria-hidden>←</span>
              Volver al inicio
            </Link>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold tracking-wide text-[#087f9b] uppercase">
                Acceso seguro
              </p>
              <h1 className="text-3xl font-bold text-slate-900">Iniciar sesión</h1>
              <p className="text-sm text-slate-500">
                Ingresa tus credenciales para acceder a tu espacio de trabajo.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Correo electrónico
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    placeholder="empleado@empresa.com"
                    autoComplete="username"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-3 pl-9 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#087f9b] focus:bg-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-9 pl-9 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#087f9b] focus:bg-white"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}

              {/* Botón en relieve (btn-3d) con el azul del panel izquierdo. */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="group btn-3d flex h-12 w-full cursor-pointer items-center justify-center gap-1.5 bg-[#0a7f95] text-base text-white [--btn-edge:#065a6a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
                {!isSubmitting && (
                  <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1.5">→</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
