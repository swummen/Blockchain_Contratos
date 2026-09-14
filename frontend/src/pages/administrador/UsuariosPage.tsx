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
import { useAppData } from "@/context/AppDataContext"
import type { Role, User } from "@/types/domain"
import { MoreHorizontal, Plus } from "lucide-react"

const ROLES: Role[] = ["Empleado", "Verificador", "Administrador"]

interface UserFormValues {
  name: string
  email: string
  role: Role
}

function UserFormDialog({
  open,
  onOpenChange,
  editingUser,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingUser: User | null
  onSubmit: (values: UserFormValues) => void
}) {
  // Radix Dialog solo monta este contenido mientras `open` es true, así que el
  // estado inicial ya refleja el usuario correcto en cada apertura sin un efecto.
  const [values, setValues] = React.useState<UserFormValues>(() =>
    editingUser
      ? { name: editingUser.name, email: editingUser.email, role: editingUser.role }
      : { name: "", email: "", role: "Empleado" }
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingUser ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
          <DialogDescription>
            {editingUser
              ? "Modifica el nombre, correo y rol del usuario."
              : "Registra un nuevo usuario del sistema."}
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
          </div>
          <DialogFooter>
            <Button type="submit">
              {editingUser ? "Guardar cambios" : "Crear usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function UsuariosPage() {
  const { users, createUser, updateUser, deactivateUser } = useAppData()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingUser, setEditingUser] = React.useState<User | null>(null)

  function openCreate() {
    setEditingUser(null)
    setDialogOpen(true)
  }

  function openEdit(user: User) {
    setEditingUser(user)
    setDialogOpen(true)
  }

  function handleSubmit(values: UserFormValues) {
    if (editingUser) {
      updateUser(editingUser.userId, values)
    } else {
      createUser(values)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold">Gestión de usuarios</h1>
          <p className="text-sm text-muted-foreground">Usuarios registrados por rol</p>
        </div>
        <Button onClick={openCreate}>
          <Plus /> Nuevo usuario
        </Button>
      </div>

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
            {users.map((u) => (
              <TableRow key={u.userId}>
                <TableCell className="font-medium">{u.userId}</TableCell>
                <TableCell>{u.name}</TableCell>
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
                      <Button variant="ghost" size="icon-sm">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => openEdit(u)}>Editar</DropdownMenuItem>
                      {u.status === "Activo" && (
                        <DropdownMenuItem onSelect={() => deactivateUser(u.userId)}>
                          Desactivar
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <UserFormDialog
        key={`${dialogOpen}-${editingUser?.userId ?? "new"}`}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingUser={editingUser}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
