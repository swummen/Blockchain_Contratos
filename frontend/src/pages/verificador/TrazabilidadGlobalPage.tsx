import { useAppData } from "@/context/AppDataContext"
import { TraceabilityTable } from "@/components/shared/TraceabilityTable"

export default function TrazabilidadGlobalPage() {
  const { events } = useAppData()
  const sorted = [...events].sort((a, b) => b.timestamp.localeCompare(a.timestamp))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">Trazabilidad global</h1>
        <p className="text-sm text-muted-foreground">
          Historial completo de acciones sobre todos los documentos
        </p>
      </div>

      <TraceabilityTable events={sorted} />
    </div>
  )
}
