import { useEffect, useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { useSession } from "@/context/SessionContext"
import { BrandLogo } from "@/components/shared/BrandLogo"
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
  const { pathname } = useLocation()
  // Solo en celular: el menú se despliega bajo la barra superior.
  const [menuOpen, setMenuOpen] = useState(false)
  const theme = user ? THEME_BY_ROLE[user.role] : null

  // Las ventanas emergentes (Radix) se montan en <body>, fuera de este layout:
  // el tema también va en <body> para que sus botones tomen el color del rol.
  useEffect(() => {
    if (!theme) return
    document.body.classList.add(theme)
    return () => document.body.classList.remove(theme)
  }, [theme])

  if (!user) return null

  return (
    // Fondo gris con dos tarjetas flotantes (menú y contenido); el color del
    // rol va solo dentro del menú. En celular el menú pasa arriba y se pliega.
    <div className="min-h-screen bg-slate-100 p-3 md:p-6">
      <div
        className={cn(
          "mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1800px] flex-col gap-3 md:min-h-[calc(100vh-3rem)] md:flex-row md:gap-4",
          THEME_BY_ROLE[user.role]
        )}
      >
        <header className="flex items-center justify-between gap-3 rounded-2xl bg-sidebar px-4 py-3 text-sidebar-foreground shadow-xl shadow-slate-900/10 md:hidden">
          <div className="flex min-w-0 items-center gap-2.5">
            <BrandLogo className="size-8 rounded-lg" />
            <div className="min-w-0">
              <p className="truncate text-sm leading-tight font-semibold">TrazaDoc</p>
              <p className="truncate text-xs text-sidebar-foreground/60">{user.role}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            className="flex size-9 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-sidebar-accent"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </header>

        <aside
          className={cn(
            "flex-col rounded-3xl bg-sidebar text-sidebar-foreground shadow-xl shadow-slate-900/10 md:flex md:w-64 md:shrink-0",
            menuOpen ? "flex animate-in duration-200 fade-in slide-in-from-top-2" : "hidden"
          )}
        >
          <div className="hidden items-center gap-2.5 border-b border-sidebar-border px-4 py-4 md:flex">
            <BrandLogo className="size-8 rounded-lg" />
            <div className="min-w-0">
              <p className="truncate text-sm leading-tight font-semibold">TrazaDoc</p>
              <p className="truncate text-xs text-sidebar-foreground/60">{user.role}</p>
            </div>
          </div>
          {/* Elegir una opción cierra el menú en celular. */}
          <div className="flex flex-1 flex-col" onClick={() => setMenuOpen(false)}>
            <RoleSidebar role={user.role} />
          </div>
          <div className="border-t border-sidebar-border p-3">
            <UserMenu />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col rounded-3xl bg-white shadow-xl shadow-slate-900/10">
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            {/* La key reinicia la animación de entrada en cada cambio de pantalla. */}
            <div
              key={pathname}
              className="animate-in duration-500 fade-in slide-in-from-bottom-4"
            >
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
