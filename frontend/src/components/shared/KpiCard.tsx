import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface KpiCardProps {
  label: string
  /** "..." mientras carga el dato real. */
  value: number | string
  icon: LucideIcon
  tone?: "default" | "success" | "warning" | "destructive"
}

// Ícono de línea en un cuadro con borde del mismo color (estilo del dashboard).
const TONE_CLASS: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  default: "text-sky-600 ring-sky-200 bg-sky-50",
  success: "text-emerald-600 ring-emerald-200 bg-emerald-50",
  warning: "text-amber-500 ring-amber-200 bg-amber-50",
  destructive: "text-rose-600 ring-rose-200 bg-rose-50",
}

export function KpiCard({ label, value, icon: Icon, tone = "default" }: KpiCardProps) {
  return (
    <div className="group dashboard-card p-4 sm:p-5">
      <div
        className={cn(
          "flex size-10 items-center justify-center rounded-xl ring-1 transition-transform duration-200 group-hover:scale-110",
          TONE_CLASS[tone]
        )}
      >
        <Icon className="size-5" strokeWidth={1.75} />
      </div>
      <p className="mt-4 text-sm leading-snug text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        {value}
      </p>
    </div>
  )
}
