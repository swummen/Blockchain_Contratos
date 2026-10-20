import * as React from "react"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { useSession } from "@/context/SessionContext"
import {
  createUser,
  deactivateUser,
  listUsers,
  updateUser,
  type UserInput,
} from "@/lib/api"
import type { Role, User } from "@/types/domain"
import { CheckCircle2, MoreHorizontal, Plus, X } from "lucide-react"

const ROLES: Role[] = ["Empleado", "Verificador", "Administrador"]

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

function UserFormDialog({
  open,
  onOpenChange,
  editingUser,
  isSelf,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingUser: User | null
  /** El Administrador editándose a sí mismo: el rol queda fijo (el backend lo rechaza igual). */
  isSelf: boolean
  onSubmit: (values: UserInput) => Promise<void>
}) {
  // El diálogo se monta en cada apertura: el estado inicial ya trae el usuario correcto.
  const [values, setValues] = React.useState<UserInput>(() =>
    editingUser
      ? { name: editingUser.name, email: editingUser.email, role: editingUser.role }
      : { name: "", email: "", role: "Empleado" }
  )
  const [error, setError] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)

  const roleChanged = editingUser !== null && values.role !== editingUser.role

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onSubmit(values)
      onOpenChange(false)
    } catch (err) {
      // Queda abierto con lo escrito para corregir el error (por ejemplo, correo duplicado).
      setError(errorMessage(err, "No se pudo guardar el usuario."))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingUser ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
          <DialogDescription>
            {editingUser
              ? "Modifica el nombre, correo y rol del usuario."
              : "Registra un nuevo usuario del sistema. Entrará con una contraseña temporal."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="user-name">Nombre</Label>
            <Input
              id="user-name"
              required
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="user-email">Correo</Label>
            <Input
              id="user-email"
              type="email"
              required
              value={values.email}
              onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="user-role">Rol</Label>
            <Select
              value={values.role}
              disabled={isSelf}
              onValueChange={(role) => setValues((v) => ({ ...v, role: role as Role }))}
            >
              <SelectTrigger id="user-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isSelf && (
              <p className="text-xs text-muted-foreground">
                No puedes cambiar tu propio rol.
              </p>
            )}
            {roleChanged && (
              <p className="text-xs text-muted-foreground">
                Al cambiar el rol se cerrarán las sesiones abiertas de este usuario; deberá
                volver a iniciar sesión.
              </p>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando…" : editingUser ? "Guardar cambios" : "Crear usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function UsuariosPage() {
  const { token, user: currentUser } = useSession()

  const [users, setUsers] = React.useState<User[] | null>(null)
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [actionError, setActionError] = React.useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingUser, setEditingUser] = React.useState<User | null>(null)
  const [created, setCreated] = React.useState<{ user: User; temporaryPassword: string } | null>(
    null
  )
  const [toDeactivate, setToDeactivate] = React.useState<User | null>(null)

  React.useEffect(() => {
    if (!token) return
    let cancelled = false

    listUsers(token)
      .then((list) => {
        if (!cancelled) setUsers(list)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(errorMessage(err, "No se pudieron cargar los usuarios."))
      })

    return () => {
      cancelled = true
    }
  }, [token])

  function replaceUser(updated: User) {
    setUsers((list) => list?.map((u) => (u.userId === updated.userId ? updated : u)) ?? null)
  }

  function openCreate() {
    setEditingUser(null)
    setDialogOpen(true)
  }

  function openEdit(user: User) {
    setEditingUser(user)
    setDialogOpen(true)
  }

  // Lanza en error: el diálogo lo atrapa y lo muestra sin cerrarse.
  async function handleSubmit(values: UserInput) {
    if (!token) return
    setActionError(null)
    if (editingUser) {
      const { user } = await updateUser(token, editingUser.userId, values)
      replaceUser(user)
    } else {
      const result = await createUser(token, values)
      setUsers((list) => (list ? [...list, result.user] : [result.user]))
      setCreated(result)
    }
  }

  async function handleDeactivate(user: User) {
    if (!token) return
    setActionError(null)
    try {
      await deactivateUser(token, user.userId)
      replaceUser({ ...user, status: "Inactivo" })
    } catch (err) {
      setActionError(errorMessage(err, "No se pudo desactivar el usuario."))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold">Gestión de usuarios</h1>
          <p className="text-sm text-muted-foreground">Usuarios registrados por rol</p>
        </div>
        <Button onClick={openCreate} disabled={users === null}>
          <Plus /> Nuevo usuario
        </Button>
      </div>

      {created && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="space-y-1 text-sm">
            <p className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
              Usuario {created.user.name} creado
            </p>
            <p className="text-muted-foreground">
              Comunícale que inicie sesión con <strong>{created.user.email}</strong> y la
              contraseña temporal{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
                {created.temporaryPassword}
              </code>
              , y que la cambie desde su menú de usuario.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Cerrar aviso"
            onClick={() => setCreated(null)}
          >
            <X className="size-4" />
          </Button>
        </div>
      )}

      {actionError && <p className="text-sm text-destructive">{actionError}</p>}

      {loadError ? (
        <p className="text-sm text-destructive">{loadError}</p>
      ) : users === null ? (
        <p className="text-sm text-muted-foreground">Cargando usuarios…</p>
      ) : (
        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-9" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const isSelf = u.userId === currentUser?.userId
                return (
                  <TableRow key={u.userId}>
                    {/* Los usuarios creados aquí tienen un UUID: se muestra recortado. */}
                    <TableCell
                      className="max-w-28 truncate font-mono text-xs font-medium"
                      title={u.userId}
                    >
                      {u.userId}
                    </TableCell>
                    <TableCell>
                      {u.name}
                      {isSelf && <span className="ml-1.5 text-xs text-muted-foreground">(tú)</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{u.role.toLowerCase()}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={u.status === "Activo" ? "success" : "secondary"}>
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label={`Acciones para ${u.name}`}>
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => openEdit(u)}>Editar</DropdownMenuItem>
                          {u.status === "Activo" && !isSelf && (
                            <DropdownMenuItem onSelect={() => setToDeactivate(u)}>
                              Desactivar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <UserFormDialog
        key={`${dialogOpen}-${editingUser?.userId ?? "new"}`}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingUser={editingUser}
        isSelf={editingUser !== null && editingUser.userId === currentUser?.userId}
        onSubmit={handleSubmit}
      />

      <AlertDialog
        open={toDeactivate !== null}
        onOpenChange={(open) => {
          if (!open) setToDeactivate(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar a {toDeactivate?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              No podrá volver a iniciar sesión y se cerrarán sus sesiones abiertas. Sus
              documentos y su trazabilidad se conservan. Esta acción no se puede deshacer
              desde la aplicación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (toDeactivate) void handleDeactivate(toDeactivate)
              }}
            >
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
