import * as React from "react"
import * as api from "@/lib/api"
import type { Role, User } from "@/types/domain"

type AuthStage = "anonymous" | "pending-otp" | "authenticated"

interface SessionState {
  stage: AuthStage
  user: User | null
  // D7 del plan de Sprint 1: el JWT vive solo en memoria (no localStorage),
  // se pierde al recargar la página — aceptable, no hay RF que pida
  // "recordarme".
  token: string | null
  pendingRole: Role | null
  pendingEmail: string | null
}

interface ActionResult {
  ok: boolean
  error?: string
}

interface SessionContextValue extends SessionState {
  login: (email: string, password: string, role: Role) => Promise<ActionResult>
  verifyOtp: (code: string) => Promise<ActionResult>
  logout: () => void
  changePassword: (current: string, next: string) => ActionResult
}

const SessionContext = React.createContext<SessionContextValue | undefined>(
  undefined
)

const initialState: SessionState = {
  stage: "anonymous",
  user: null,
  token: null,
  pendingRole: null,
  pendingEmail: null,
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<SessionState>(initialState)

  const login = React.useCallback(
    async (email: string, password: string, role: Role): Promise<ActionResult> => {
      if (!email.trim() || !password.trim()) {
        return { ok: false, error: "Ingresa tu correo y tu contraseña." }
      }
      const trimmedEmail = email.trim()
      try {
        await api.login(trimmedEmail, password, role)
      } catch (err) {
        return { ok: false, error: errorMessage(err, "No se pudo iniciar sesión.") }
      }
      setState({
        stage: "pending-otp",
        user: null,
        token: null,
        pendingRole: role,
        pendingEmail: trimmedEmail,
      })
      return { ok: true }
    },
    []
  )

  const verifyOtp = React.useCallback(
    async (code: string): Promise<ActionResult> => {
      const email = state.pendingEmail
      if (!email) {
        return { ok: false, error: "Vuelve a iniciar sesión." }
      }

      let result: { token: string; user: User }
      try {
        result = await api.verifyOtp(email, code)
      } catch (err) {
        return { ok: false, error: errorMessage(err, "No se pudo verificar el código.") }
      }

      // Guarda contra un 200 con body inesperado (ej. no-JSON silencioso en
      // postAuthJson): sin esto, un resultado incompleto dejaría la UI en un
      // estado "authenticated" sin usuario, sin poder volver atrás.
      if (!result.token || !result.user) {
        return { ok: false, error: "No se pudo verificar el código." }
      }

      setState({
        stage: "authenticated",
        user: result.user,
        token: result.token,
        pendingRole: null,
        pendingEmail: null,
      })
      return { ok: true }
    },
    [state.pendingEmail]
  )

  const logout = React.useCallback(() => {
    setState(initialState)
  }, [])

  const changePassword = React.useCallback(
    (current: string, next: string): ActionResult => {
      if (!current.trim()) {
        return { ok: false, error: "Ingresa tu contraseña actual." }
      }
      if (!next.trim() || next === current) {
        return {
          ok: false,
          error: "La nueva contraseña debe ser diferente a la actual.",
        }
      }
      return { ok: true }
    },
    []
  )

  const value = React.useMemo<SessionContextValue>(
    () => ({ ...state, login, verifyOtp, logout, changePassword }),
    [state, login, verifyOtp, logout, changePassword]
  )

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = React.useContext(SessionContext)
  if (!ctx) throw new Error("useSession debe usarse dentro de SessionProvider")
  return ctx
}
