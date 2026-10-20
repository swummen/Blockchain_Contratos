import * as React from "react"
import * as api from "@/lib/api"
import type { User } from "@/types/domain"

type AuthStage = "anonymous" | "pending-otp" | "authenticated"

interface SessionState {
  stage: AuthStage
  user: User | null
  // Solo en memoria (no localStorage): recargar la página cierra la sesión.
  token: string | null
  pendingEmail: string | null
}

interface ActionResult {
  ok: boolean
  error?: string
}

interface SessionContextValue extends SessionState {
  login: (email: string, password: string) => Promise<ActionResult>
  verifyOtp: (code: string) => Promise<ActionResult>
  logout: () => Promise<void>
  changePassword: (current: string, next: string) => Promise<ActionResult>
}

const SessionContext = React.createContext<SessionContextValue | undefined>(
  undefined
)

const initialState: SessionState = {
  stage: "anonymous",
  user: null,
  token: null,
  pendingEmail: null,
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<SessionState>(initialState)

  const login = React.useCallback(
    async (email: string, password: string): Promise<ActionResult> => {
      if (!email.trim() || !password.trim()) {
        return { ok: false, error: "Ingresa tu correo y tu contraseña." }
      }
      const trimmedEmail = email.trim()
      try {
        await api.login(trimmedEmail, password)
      } catch (err) {
        return { ok: false, error: errorMessage(err, "No se pudo iniciar sesión.") }
      }
      setState({
        stage: "pending-otp",
        user: null,
        token: null,
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

      // Evita quedar "autenticado" sin usuario si la respuesta llega incompleta.
      if (!result.token || !result.user) {
        return { ok: false, error: "No se pudo verificar el código." }
      }

      setState({
        stage: "authenticated",
        user: result.user,
        token: result.token,
        pendingEmail: null,
      })
      return { ok: true }
    },
    [state.pendingEmail]
  )

  const logout = React.useCallback(async () => {
    const token = state.token
    if (token) {
      try {
        await api.logout(token)
      } catch {
        // Si el backend falla o la sesión ya venció, igual se limpia el estado local.
      }
    }
    setState(initialState)
  }, [state.token])

  const changePassword = React.useCallback(
    async (current: string, next: string): Promise<ActionResult> => {
      if (!current.trim()) {
        return { ok: false, error: "Ingresa tu contraseña actual." }
      }
      if (!next.trim() || next === current) {
        return {
          ok: false,
          error: "La nueva contraseña debe ser diferente a la actual.",
        }
      }
      const token = state.token
      if (!token) {
        return { ok: false, error: "Vuelve a iniciar sesión." }
      }
      try {
        await api.changePassword(token, current, next)
      } catch (err) {
        return { ok: false, error: errorMessage(err, "No se pudo cambiar la contraseña.") }
      }
      return { ok: true }
    },
    [state.token]
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
