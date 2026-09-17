import * as React from "react"
import { documents as seedDocuments } from "@/data/documents"
import { users as seedUsers } from "@/data/users"
import { events as seedEvents } from "@/data/events"
import type { ContractDocument, TraceEvent, User, Role } from "@/types/domain"
import { computeSha256Hex } from "@/lib/sha256"
import { nextDocumentId, newTxId, newEventId } from "@/lib/ids"
import { formatBytes } from "@/lib/format"

const MAX_FILE_SIZE = 20 * 1024 * 1024

interface RegisterResult {
  ok: boolean
  error?: string
  document?: ContractDocument
}

interface VerifyResult {
  ok: boolean
  error?: string
  status?: "Verificado" | "Alterado"
  computedHash?: string
}

interface AppDataContextValue {
  documents: ContractDocument[]
  users: User[]
  events: TraceEvent[]
  registerDocument: (
    file: File,
    responsibleUser: string
  ) => Promise<RegisterResult>
  verifyDocument: (
    referenceHash: string,
    documentId: string | null,
    compareFile: File,
    verifiedBy: string
  ) => Promise<VerifyResult>
  createUser: (input: { name: string; email: string; role: Role }) => void
  updateUser: (
    userId: string,
    input: { name: string; email: string; role: Role }
  ) => void
  deactivateUser: (userId: string) => void
  eventsForDocument: (documentId: string) => TraceEvent[]
}

const AppDataContext = React.createContext<AppDataContextValue | undefined>(
  undefined
)

/** Formato y tamaño se validan antes de registrar o hashear (RF-12, RF-29). */
function validatePdf(file: File): string | null {
  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  if (!isPdf) return "Solo se aceptan archivos en formato PDF."
  if (file.size > MAX_FILE_SIZE) {
    return "El archivo supera el límite de 20 MB. Cargue un PDF de 20 MB o menos."
  }
  return null
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = React.useState<ContractDocument[]>(seedDocuments)
  const [users, setUsers] = React.useState<User[]>(seedUsers)
  const [events, setEvents] = React.useState<TraceEvent[]>(seedEvents)

  const registerDocument = React.useCallback(
    async (file: File, responsibleUser: string): Promise<RegisterResult> => {
      const validationError = validatePdf(file)
      if (validationError) return { ok: false, error: validationError }

      const hash = await computeSha256Hex(file)
      const documentId = nextDocumentId(documents.map((d) => d.documentId))
      const now = new Date().toISOString()

      const document: ContractDocument = {
        documentId,
        name: file.name,
        responsibleUser,
        registeredAt: now,
        sizeLabel: formatBytes(file.size),
        hash,
        status: "Pendiente",
      }

      setDocuments((prev) => [document, ...prev])
      setEvents((prev) => [
        {
          eventId: newEventId(),
          documentId,
          action: "registro",
          user: responsibleUser,
          txId: newTxId(),
          timestamp: now,
        },
        ...prev,
      ])

      return { ok: true, document }
    },
    [documents]
  )

  const verifyDocument = React.useCallback(
    async (
      referenceHash: string,
      documentId: string | null,
      compareFile: File,
      verifiedBy: string
    ): Promise<VerifyResult> => {
      const validationError = validatePdf(compareFile)
      if (validationError) return { ok: false, error: validationError }

      const computedHash = await computeSha256Hex(compareFile)
      const matches = computedHash === referenceHash
      // Único punto que cambia el estado de un documento; nunca es manual (RF-34).
      const status: "Verificado" | "Alterado" = matches ? "Verificado" : "Alterado"
      const now = new Date().toISOString()

      if (documentId) {
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.documentId === documentId ? { ...doc, status } : doc
          )
        )
        setEvents((prev) => [
          {
            eventId: newEventId(),
            documentId,
            action: "verificacion",
            user: verifiedBy,
            txId: newTxId(),
            timestamp: now,
            result: matches ? "confirmada" : "comprometida",
          },
          ...prev,
        ])
      }

      return { ok: true, status, computedHash }
    },
    []
  )

  const createUser = React.useCallback(
    (input: { name: string; email: string; role: Role }) => {
      setUsers((prev) => [
        {
          userId: `U${String(prev.length + 1).padStart(3, "0")}`,
          status: "Activo",
          ...input,
        },
        ...prev,
      ])
    },
    []
  )

  const updateUser = React.useCallback(
    (userId: string, input: { name: string; email: string; role: Role }) => {
      setUsers((prev) =>
        prev.map((u) => (u.userId === userId ? { ...u, ...input } : u))
      )
    },
    []
  )

  // Baja lógica: nunca se borra el usuario ni su trazabilidad histórica (RF-47).
  const deactivateUser = React.useCallback((userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.userId === userId ? { ...u, status: "Inactivo" } : u))
    )
  }, [])

  const eventsForDocument = React.useCallback(
    (documentId: string) => events.filter((e) => e.documentId === documentId),
    [events]
  )

  const value = React.useMemo<AppDataContextValue>(
    () => ({
      documents,
      users,
      events,
      registerDocument,
      verifyDocument,
      createUser,
      updateUser,
      deactivateUser,
      eventsForDocument,
    }),
    [
      documents,
      users,
      events,
      registerDocument,
      verifyDocument,
      createUser,
      updateUser,
      deactivateUser,
      eventsForDocument,
    ]
  )

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  )
}

export function useAppData() {
  const ctx = React.useContext(AppDataContext)
  if (!ctx) throw new Error("useAppData debe usarse dentro de AppDataProvider")
  return ctx
}
