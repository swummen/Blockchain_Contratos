import type { Role } from "@/types/domain"

// Panel de inicio de cada rol, después del código y de la política.
export const ROLE_HOME: Record<Role, string> = {
  Empleado: "/empleado",
  Verificador: "/verificador",
  Administrador: "/administrador",
}
