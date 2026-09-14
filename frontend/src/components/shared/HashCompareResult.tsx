import { CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDateTime } from "@/lib/format"

interface HashCompareResultProps {
  matches: boolean
  timestamp: string
}

/** Panel de resultado de RF-32: integridad confirmada o comprometida. */
export function HashCompareResult({ matches, timestamp }: HashCompareResultProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border p-4",
        matches
          ? "border-emerald-500/30 bg-emerald-500/10"
          : "border-destructive/30 bg-destructive/10"
      )}
    >
      {matches ? (
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
      )}
      <div>
        <p
          className={cn(
            "text-sm font-medium",
            matches
              ? "text-emerald-700 dark:text-emerald-400"
              : "text-destructive"
          )}
        >
          {matches
            ? "Integridad confirmada — Los hashes son idénticos"
            : "Integridad comprometida — Los hashes no coinciden"}
        </p>
        <p className="text-xs text-muted-foreground">
          Resultado registrado en trazabilidad · {formatDateTime(timestamp)}
        </p>
      </div>
    </div>
  )
}
