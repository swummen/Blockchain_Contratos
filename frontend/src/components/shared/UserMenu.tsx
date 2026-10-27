import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useSession } from "@/context/SessionContext"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ChevronsUpDown, LogOut, KeyRound } from "lucide-react"
import { ChangePasswordDialog } from "./ChangePasswordDialog"

export function UserMenu() {
  const { user, logout } = useSession()
  const navigate = useNavigate()
  const [changePasswordOpen, setChangePasswordOpen] = React.useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = React.useState(false)

  if (!user) return null

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  const identity = (
    <>
      {/* Fondo translúcido: bg-sidebar-primary es el del ítem activo. */}
      <Avatar>
        <AvatarFallback className="bg-white/10 text-sidebar-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col text-sm leading-tight">
        <span className="truncate font-medium text-sidebar-foreground">{user.name}</span>
        <span className="truncate text-xs text-sidebar-foreground/60">{user.email}</span>
      </div>
    </>
  )

  const accountActionClass =
    "flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-white/20 active:scale-[0.98]"

  return (
    <>
      {/* Celular: las acciones de la cuenta van a la vista, sin menú desplegable. */}
      <div className="space-y-3 md:hidden">
        <div className="flex items-center gap-2.5 px-2">{identity}</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className={accountActionClass}
            onClick={() => setChangePasswordOpen(true)}
          >
            <KeyRound className="size-4" />
            Contraseña
          </button>
          <button
            type="button"
            className={accountActionClass}
            onClick={() => setLogoutConfirmOpen(true)}
          >
            <LogOut className="size-4" />
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Computador: menú desplegable; la flecha indica que se puede abrir. */}
      <DropdownMenu>
        <DropdownMenuTrigger className="hidden w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-left outline-none hover:bg-sidebar-accent focus-visible:ring-3 focus-visible:ring-sidebar-ring/50 md:flex">
          {identity}
          <ChevronsUpDown className="size-4 shrink-0 text-sidebar-foreground/60" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{user.role}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setChangePasswordOpen(true)}>
            <KeyRound /> Cambiar contraseña
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setLogoutConfirmOpen(true)}>
            <LogOut /> Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
      <AlertDialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              Se cerrará tu sesión actual y volverás a la página de inicio de
              sesión.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await logout()
                navigate("/sesion-cerrada")
              }}
            >
              Cerrar sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
