import { Navigate, Outlet } from "react-router-dom"
import { useSession } from "@/context/SessionContext"
import type { Role } from "@/types/domain"

/** RF-05: acceso solo si hay sesión válida y el rol coincide con la ruta. */
export function ProtectedRoute({ allowedRole }: { allowedRole: Role }) {
  const { stage, user } = useSession()

  if (stage !== "authenticated" || !user || user.role !== allowedRole) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
