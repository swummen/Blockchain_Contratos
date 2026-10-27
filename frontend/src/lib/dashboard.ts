import { ShieldAlert, ShieldCheck, Upload, type LucideIcon } from "lucide-react"
import type { DocumentEvent, DocumentSummary } from "@/lib/api"
import { formatDateTime } from "@/lib/format"
import type { RecentItem } from "@/components/shared/dashboard"

// Cómo se muestra cada evento de trazabilidad como tarjeta de notificación
// (dashboard del Administrador e inicio del Verificador).
export function eventToRecentItem(
  event: DocumentEvent,
  documentName: string,
  to: string
): RecentItem {
  const base = { key: event.txId, to, meta: formatDateTime(event.timestamp) }
  if (event.action === "registro") {
    return {
      ...base,
      icon: Upload,
      tile: "bg-amber-400",
      title: `${event.userName} cargó un documento`,
      detail: documentName,
    }
  }
  if (event.result === "comprometida") {
    return {
      ...base,
      icon: ShieldAlert,
      tile: "bg-rose-500",
      title: "Se detectó una alteración",
      detail: `${documentName} · verificó ${event.userName}`,
    }
  }
  return {
    ...base,
    icon: ShieldCheck,
    tile: "bg-emerald-500",
    title: `${event.userName} verificó un documento`,
    detail: `${documentName} · íntegro`,
  }
}

const STATUS_STYLE: Record<DocumentSummary["status"], { icon: LucideIcon; tile: string; label: string }> = {
  Pendiente: { icon: Upload, tile: "bg-amber-400", label: "pendiente de verificar" },
  Verificado: { icon: ShieldCheck, tile: "bg-emerald-500", label: "verificado e íntegro" },
  Alterado: { icon: ShieldAlert, tile: "bg-rose-500", label: "alterado" },
}

// Documento del Empleado como tarjeta: el color dice en qué estado está.
export function documentToRecentItem(doc: DocumentSummary, to: string): RecentItem {
  const { icon, tile, label } = STATUS_STYLE[doc.status]
  return {
    key: doc.documentId,
    to,
    icon,
    tile,
    title: doc.name,
    detail: `Estado: ${label}`,
    meta: `Cargado el ${formatDateTime(doc.registeredAt)}`,
  }
}

// Totales por estado contados en el navegador (el resumen del backend es solo
// del Administrador). El listado trae hasta 100 documentos.
export function countByStatus(docs: DocumentSummary[]) {
  return {
    total: docs.length,
    verificado: docs.filter((d) => d.status === "Verificado").length,
    pendiente: docs.filter((d) => d.status === "Pendiente").length,
    alterado: docs.filter((d) => d.status === "Alterado").length,
  }
}
