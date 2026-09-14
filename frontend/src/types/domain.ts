export type Role = "Empleado" | "Verificador" | "Administrador"

export type UserStatus = "Activo" | "Inactivo"

export interface User {
  userId: string
  name: string
  email: string
  role: Role
  status: UserStatus
}

export type DocumentStatus = "Pendiente" | "Verificado" | "Alterado"

export interface ContractDocument {
  documentId: string
  name: string
  responsibleUser: string
  registeredAt: string
  sizeLabel: string
  hash: string
  status: DocumentStatus
}

export type TraceAction = "registro" | "verificacion"

export type TraceResult = "confirmada" | "comprometida"

export interface TraceEvent {
  eventId: string
  documentId: string
  action: TraceAction
  user: string
  txId: string
  timestamp: string
  result?: TraceResult
}
