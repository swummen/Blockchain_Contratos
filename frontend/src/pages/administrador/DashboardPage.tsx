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
import {
  getAllEvents,
  getDocumentsSummary,
  listDocuments,
  type DocumentEvent,
  type DocumentsSummary,
} from "@/lib/api"
import { eventToRecentItem } from "@/lib/dashboard"
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  FileText,
  History,
  Users,
} from "lucide-react"

const RECENT_LIMIT = 3

const QUICK_LINKS: QuickLink[] = [
  { to: "/administrador/usuarios", label: "Gestionar usuarios", icon: Users, tone: "text-sky-600 ring-sky-200" },
  { to: "/administrador/documentos", label: "Ver documentos", icon: FileText, tone: "text-amber-500 ring-amber-200" },
  { to: "/administrador/trazabilidad", label: "Revisar trazabilidad", icon: History, tone: "text-emerald-600 ring-emerald-200" },
  { to: "/administrador/documentos", label: "Documentos alterados", icon: AlertTriangle, tone: "text-rose-600 ring-rose-200" },
]

export default function DashboardPage() {
  const { token, user } = useSession()

  const [summary, setSummary] = React.useState<DocumentsSummary | null>(null)
  const [summaryError, setSummaryError] = React.useState<string | null>(null)
  const [recent, setRecent] = React.useState<DocumentEvent[] | null>(null)
  const [recentError, setRecentError] = React.useState<string | null>(null)
  const [documentNames, setDocumentNames] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    if (!token) return
    let cancelled = false

    // Totales y actividad se cargan por separado: si una falla, la otra se muestra.
    getDocumentsSummary(token)
      .then((s) => {
        if (!cancelled) setSummary(s)
      })
      .catch((err) => {
        if (!cancelled) {
          setSummaryError(err instanceof Error ? err.message : "No se pudieron cargar los totales.")
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

    // Solo para mostrar nombres de archivo; si falla se muestra el identificador.
    listDocuments(token)
      .then((docs) => {
        if (!cancelled) {
          setDocumentNames(Object.fromEntries(docs.map((d) => [d.documentId, d.name])))
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [token])

  const recentItems =
    recent?.map((event) =>
      eventToRecentItem(
        event,
        documentNames[event.documentId] ?? event.documentId,
        "/administrador/trazabilidad"
      )
    ) ?? null

  return (
    <div className="space-y-6">
      <DashboardHeader title="Dashboard" subtitle="Vista general del estado documental" />

      <DashboardTopRow>
        <GreetingCard
          firstName={user?.name.split(" ")[0] ?? ""}
          question="¿Qué vamos a revisar hoy?"
          links={QUICK_LINKS}
        />
        <RecentSection
          title="Actividad reciente"
          icon={Bell}
          seeAllTo="/administrador/trazabilidad"
          items={recentItems}
          error={recentError}
          emptyText="Todavía no hay acciones registradas."
        />
      </DashboardTopRow>

      {summaryError ? (
        <p className="text-sm text-destructive">{summaryError}</p>
      ) : (
        <KpiGrid>
          <KpiCard label="Total de documentos" value={summary?.total ?? "..."} icon={FileText} />
          <KpiCard label="Documentos verificados" value={summary?.verificado ?? "..."} icon={CheckCircle2} tone="success" />
          <KpiCard label="Pendientes de verificar" value={summary?.pendiente ?? "..."} icon={Clock} tone="warning" />
          <KpiCard label="Documentos alterados" value={summary?.alterado ?? "..."} icon={AlertTriangle} tone="destructive" />
        </KpiGrid>
      )}
    </div>
  )
}
