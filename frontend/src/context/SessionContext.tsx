import * as React from "react"
import { users as seedUsers } from "@/data/users"
import type { Role, User } from "@/types/domain"

type AuthStage = "anonymous" | "pending-otp" | "authenticated"

interface SessionState {
  stage: AuthStage
  user: User | null
  pendingRole: Role | null
  pendingEmail: string | null
}

interface ActionResult {
  ok: boolean
  error?: string
}

interface SessionContextValue extends SessionState {
  login: (email: string, password: string) => ActionResult
  verifyOtp: (code: string) => ActionResult
  logout: () => void
  changePassword: (current: string, next: string) => ActionResult
}

const SessionContext = React.createContext<SessionContextValue | undefined>(
  undefined
)

/** Código fijo de demostración: no hay backend que envíe un correo real (RF-03/04). */
const DEMO_OTP_CODE = "123456"

const initialState: SessionState = {
  stage: "anonymous",
  user: null,
  pendingRole: null,
  pendingEmail: null,
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<SessionState>(initialState)

  const login = React.useCallback(
    (email: string, password: string): ActionResult => {
      if (!email.trim() || !password.trim()) {
        return { ok: false, error: "Ingresa tu correo y tu contraseña." }
      }
      const trimmedEmail = email.trim()
      const existing = seedUsers.find(
        (u) => u.email.toLowerCase() === trimmedEmail.toLowerCase()
      )
      if (!existing) {
        return {
          ok: false,
          error: "No existe una cuenta registrada con ese correo.",
        }
      }
      setState({
        stage: "pending-otp",
        user: null,
        pendingRole: existing.role,
        pendingEmail: trimmedEmail,
      })
      return { ok: true }
    },
    []
  )

  const verifyOtp = React.useCallback(
    (code: string): ActionResult => {
      if (code !== DEMO_OTP_CODE) {
        return { ok: false, error: "El código ingresado no es válido." }
      }

      const email = state.pendingEmail
      if (!email) {
        return { ok: false, error: "Vuelve a iniciar sesión." }
      }

      const existing = seedUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      )
      if (!existing) {
        return { ok: false, error: "Vuelve a iniciar sesión." }
      }
      if (existing.status === "Inactivo") {
        return {
          ok: false,
          error: "Este usuario está desactivado. Contacta a un administrador.",
        }
      }

      setState({
        stage: "authenticated",
        user: existing,
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
