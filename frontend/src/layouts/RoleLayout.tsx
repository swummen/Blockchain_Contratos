import { Outlet } from "react-router-dom"
import { ShieldCheck } from "lucide-react"
import { useSession } from "@/context/SessionContext"
import { RoleSidebar } from "@/components/shared/RoleSidebar"
import { UserMenu } from "@/components/shared/UserMenu"
import { cn } from "@/lib/utils"
import type { Role } from "@/types/domain"

const THEME_BY_ROLE: Record<Role, string> = {
  Empleado: "theme-empleado",
  Verificador: "theme-verificador",
  Administrador: "theme-administrador",
}

export default function RoleLayout() {
  const { user } = useSession()
  if (!user) return null

  return (
    // Fondo gris con dos tarjetas flotantes (menú y contenido); el color del
    // rol va solo dentro del menú.
    <div className="min-h-screen bg-slate-100 p-3 md:p-6">
      <div
        className={cn(
          "mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1800px] gap-4 md:min-h-[calc(100vh-3rem)]",
          THEME_BY_ROLE[user.role]
        )}
      >
        <aside className="flex w-64 shrink-0 flex-col rounded-3xl bg-sidebar text-sidebar-foreground shadow-xl shadow-slate-900/10">
          <div className="flex items-center gap-2.5 border-b border-sidebar-border px-4 py-4">
            {/* bg-sidebar-primary es el blanco del ítem activo (RoleSidebar.tsx):
                el logo usa un fondo translúcido. */}
            <div className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-sidebar-foreground">
              <ShieldCheck className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm leading-tight font-semibold">TrazaDoc</p>
              <p className="truncate text-xs text-sidebar-foreground/60">{user.role}</p>
            </div>
          </div>
          <RoleSidebar role={user.role} />
          <div className="border-t border-sidebar-border p-3">
            <UserMenu />
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col rounded-3xl bg-white shadow-xl shadow-slate-900/10">
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
