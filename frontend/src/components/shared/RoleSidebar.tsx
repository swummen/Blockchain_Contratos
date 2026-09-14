import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
  Upload,
  FileText,
  History,
  LayoutDashboard,
  Users,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react"
import type { Role } from "@/types/domain"

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

const NAV_ITEMS: Record<Role, NavItem[]> = {
  Empleado: [
    { to: "/empleado/cargar", label: "Cargar documento", icon: Upload },
    { to: "/empleado/documentos", label: "Mis documentos", icon: FileText },
    { to: "/empleado/trazabilidad", label: "Mi trazabilidad", icon: History },
  ],
  Verificador: [
    { to: "/verificador/verificar", label: "Verificar integridad", icon: ShieldCheck },
    { to: "/verificador/documentos", label: "Documentos", icon: FileText },
    { to: "/verificador/trazabilidad", label: "Trazabilidad global", icon: History },
  ],
  Administrador: [
    { to: "/administrador/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/administrador/usuarios", label: "Usuarios", icon: Users },
    { to: "/administrador/documentos", label: "Documentos", icon: FileText },
    { to: "/administrador/trazabilidad", label: "Trazabilidad", icon: History },
  ],
}

export function RoleSidebar({ role }: { role: Role }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {NAV_ITEMS[role].map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActive &&
                "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
            )
          }
        >
          <Icon className="size-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
