import { useAppData } from "@/context/AppDataContext"
import { useSession } from "@/context/SessionContext"
import { TraceabilityTimeline } from "@/components/shared/TraceabilityTimeline"

export default function MiTrazabilidadPage() {
  const { user } = useSession()
  const { documents, events } = useAppData()

  const myDocumentIds = new Set(
    documents.filter((doc) => doc.responsibleUser === user?.name).map((d) => d.documentId)
  )
  const myEvents = events
    .filter((e) => myDocumentIds.has(e.documentId))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">Mi trazabilidad</h1>
        <p className="text-sm text-muted-foreground">
          Historial de acciones sobre tus documentos
        </p>
      </div>

      <TraceabilityTimeline events={myEvents} />
    </div>
  )
}
