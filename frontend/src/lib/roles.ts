import type { Role } from "@/types/domain"

// Pantalla de entrada de cada rol tras iniciar sesión (OTP y política de datos).
export const ROLE_HOME: Record<Role, string> = {
  Empleado: "/empleado",
  Verificador: "/verificador",
  Administrador: "/administrador",
}
