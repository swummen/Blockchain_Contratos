import { useAppData } from "@/context/AppDataContext"
import { TraceabilityTable } from "@/components/shared/TraceabilityTable"

export default function TrazabilidadPage() {
  const { events } = useAppData()
  const sorted = [...events].sort((a, b) => b.timestamp.localeCompare(a.timestamp))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">Historial de trazabilidad</h1>
        <p className="text-sm text-muted-foreground">
          Registro de todas las acciones por documento · RF-22 / RF-40 / RF-51
        </p>
      </div>

      <TraceabilityTable events={sorted} />
    </div>
  )
}
