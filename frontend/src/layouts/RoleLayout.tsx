import { Outlet } from "react-router-dom"
import { ShieldCheck } from "lucide-react"
import { useSession } from "@/context/SessionContext"
import { RoleSidebar } from "@/components/shared/RoleSidebar"
import { UserMenu } from "@/components/shared/UserMenu"
import { cn } from "@/lib/utils"
import type { Role } from "@/types/domain"

const THEME_BY_ROLE: Record<Role, string> = {
  Empleado: "theme-navy",
  Administrador: "theme-navy",
  Verificador: "theme-verde",
}

export default function RoleLayout() {
  const { user } = useSession()
  if (!user) return null

  return (
    <div className={cn("flex min-h-screen bg-background", THEME_BY_ROLE[user.role])}>
      <aside className="flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="flex items-center gap-2.5 border-b border-sidebar-border px-4 py-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
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
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
