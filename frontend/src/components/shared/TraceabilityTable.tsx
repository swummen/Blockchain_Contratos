import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDateTime } from "@/lib/format"
import type { TraceEvent } from "@/types/domain"
import { CheckCircle2, XCircle } from "lucide-react"

const ACTION_LABEL: Record<TraceEvent["action"], string> = {
  registro: "Carga de documento",
  verificacion: "Verificación de integridad",
}

// Los eventos reales del ledger no traen eventId (el mock sí): el txId ya
// es único por evento (una transacción escribe un solo evento).
type TableEvent = Omit<TraceEvent, "eventId"> & { userName?: string }

interface TraceabilityTableProps {
  events: TableEvent[]
  /** documentId → nombre legible; si falta, se muestra el identificador. */
  documentNames?: Record<string, string>
}

/** RF-22/RF-40/RF-51: Documento, Acción, Usuario, TX ID, Fecha y Resultado. */
export function TraceabilityTable({ events, documentNames }: TraceabilityTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Documento</TableHead>
          <TableHead>Acción</TableHead>
          <TableHead>Usuario</TableHead>
          <TableHead>TX ID</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Resultado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <TableRow key={event.txId}>
            <TableCell className="font-medium">
              {documentNames?.[event.documentId] ?? event.documentId}
            </TableCell>
            <TableCell>{ACTION_LABEL[event.action]}</TableCell>
            <TableCell>{event.userName ?? event.user}</TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">
              {event.txId}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDateTime(event.timestamp)}
            </TableCell>
            <TableCell>
              {event.result === "confirmada" && (
                <Badge variant="success">
                  <CheckCircle2 className="size-3" /> OK
                </Badge>
              )}
              {event.result === "comprometida" && (
                <Badge variant="destructive">
                  <XCircle className="size-3" /> Alterado
                </Badge>
              )}
              {!event.result && <span className="text-xs text-muted-foreground">N/A</span>}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
