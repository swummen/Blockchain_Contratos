import * as React from "react"
import { useSession } from "@/context/SessionContext"
import { KpiCard } from "@/components/shared/KpiCard"
import {
  DashboardHeader,
  DashboardTopRow,
  GreetingCard,
  KpiGrid,
  RecentSection,
  type QuickLink,
} from "@/components/shared/dashboard"
import { getAllEvents, listDocuments, type DocumentEvent, type DocumentSummary } from "@/lib/api"
import { countByStatus, eventToRecentItem } from "@/lib/dashboard"
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  FileText,
  History,
  ShieldCheck,
} from "lucide-react"

const RECENT_LIMIT = 3

const QUICK_LINKS: QuickLink[] = [
  { to: "/verificador/verificar", label: "Verificar integridad", icon: ShieldCheck, tone: "text-sky-600 ring-sky-200" },
  { to: "/verificador/documentos", label: "Ver documentos", icon: FileText, tone: "text-amber-500 ring-amber-200" },
  { to: "/verificador/trazabilidad", label: "Trazabilidad global", icon: History, tone: "text-emerald-600 ring-emerald-200" },
]

// Inicio del Verificador: misma estructura que el dashboard del Administrador.
export default function InicioPage() {
  const { token, user } = useSession()

  const [documents, setDocuments] = React.useState<DocumentSummary[] | null>(null)
  const [documentsError, setDocumentsError] = React.useState<string | null>(null)
  const [recent, setRecent] = React.useState<DocumentEvent[] | null>(null)
  const [recentError, setRecentError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!token) return
    let cancelled = false

    // Documentos (totales y nombres) y actividad por separado: si uno falla, el otro se muestra.
    listDocuments(token)
      .then((docs) => {
        if (!cancelled) setDocuments(docs)
      })
      .catch((err) => {
        if (!cancelled) {
          setDocumentsError(err instanceof Error ? err.message : "No se pudieron cargar los documentos.")
        }
      })

    // GET /events ya viene ordenado de más antiguo a más reciente.
    getAllEvents(token)
      .then((events) => {
        if (!cancelled) setRecent(events.slice(-RECENT_LIMIT).reverse())
      })
      .catch((err) => {
        if (!cancelled) {
          setRecentError(err instanceof Error ? err.message : "No se pudo cargar la actividad reciente.")
        }
      })

    return () => {
      cancelled = true
    }
  }, [token])

  const counts = documents ? countByStatus(documents) : null
  const documentNames = Object.fromEntries((documents ?? []).map((d) => [d.documentId, d.name]))
  const recentItems =
    recent?.map((event) =>
      eventToRecentItem(
        event,
        documentNames[event.documentId] ?? event.documentId,
        "/verificador/trazabilidad"
      )
    ) ?? null

  return (
    <div className="space-y-6">
      <DashboardHeader title="Inicio" subtitle="Tu espacio para verificar la integridad de los documentos" />

      <DashboardTopRow>
        <GreetingCard
          firstName={user?.name.split(" ")[0] ?? ""}
          question="¿Qué documento vamos a verificar hoy?"
          links={QUICK_LINKS}
          action={{ to: "/verificador/verificar", label: "Verificar un documento", icon: ShieldCheck }}
        />
        <RecentSection
          title="Actividad reciente"
          icon={Bell}
          seeAllTo="/verificador/trazabilidad"
          items={recentItems}
          error={recentError}
          emptyText="Todavía no hay acciones registradas."
        />
      </DashboardTopRow>

      {documentsError ? (
        <p className="text-sm text-destructive">{documentsError}</p>
      ) : (
        <KpiGrid>
          <KpiCard label="Total de documentos" value={counts?.total ?? "..."} icon={FileText} />
          <KpiCard label="Verificados" value={counts?.verificado ?? "..."} icon={CheckCircle2} tone="success" />
          <KpiCard label="Pendientes de verificar" value={counts?.pendiente ?? "..."} icon={Clock} tone="warning" />
          <KpiCard label="Alterados" value={counts?.alterado ?? "..."} icon={AlertTriangle} tone="destructive" />
        </KpiGrid>
      )}
    </div>
  )
}
