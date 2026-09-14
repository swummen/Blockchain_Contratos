import { Badge } from "@/components/ui/badge"
import type { DocumentStatus } from "@/types/domain"
import { CheckCircle2, Clock, AlertTriangle, type LucideIcon } from "lucide-react"

const CONFIG: Record<
  DocumentStatus,
  { variant: "success" | "warning" | "destructive"; icon: LucideIcon; label: string }
> = {
  Verificado: { variant: "success", icon: CheckCircle2, label: "verificado" },
  Pendiente: { variant: "warning", icon: Clock, label: "pendiente" },
  Alterado: { variant: "destructive", icon: AlertTriangle, label: "alterado" },
}

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const { variant, icon: Icon, label } = CONFIG[status]
  return (
    <Badge variant={variant}>
      <Icon className="size-3" />
      {label}
    </Badge>
  )
}
