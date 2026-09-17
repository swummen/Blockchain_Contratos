import type { User } from "@/types/domain"

export const users: User[] = [
  {
    userId: "U001",
    name: "María López",
    email: "m.lopez@empresa.com",
    role: "Empleado",
    status: "Activo",
  },
  {
    userId: "U002",
    name: "Carlos Ruiz",
    email: "c.ruiz@empresa.com",
    role: "Empleado",
    status: "Activo",
  },
  {
    userId: "U003",
    name: "Pedro Gómez",
    email: "p.gomez@empresa.com",
    role: "Verificador",
    status: "Activo",
  },
  {
    userId: "U004",
    name: "Ana Torres",
    email: "a.torres@empresa.com",
    role: "Empleado",
    status: "Inactivo",
  },
  {
    userId: "U005",
    name: "Laura Diaz",
    email: "admin@empresa.com",
    role: "Administrador",
    status: "Activo",
  },
]
