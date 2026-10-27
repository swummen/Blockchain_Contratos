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
import { listDocuments, type DocumentSummary } from "@/lib/api"
import { countByStatus, documentToRecentItem } from "@/lib/dashboard"
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  FolderOpen,
  History,
  Upload,
} from "lucide-react"

const RECENT_LIMIT = 3

const QUICK_LINKS: QuickLink[] = [
  { to: "/empleado/cargar", label: "Cargar documento", icon: Upload, tone: "text-sky-600 ring-sky-200" },
  { to: "/empleado/documentos", label: "Mis documentos", icon: FileText, tone: "text-amber-500 ring-amber-200" },
  { to: "/empleado/trazabilidad", label: "Mi trazabilidad", icon: History, tone: "text-emerald-600 ring-emerald-200" },
]

// Inicio del Empleado: misma estructura que el dashboard del Administrador, solo
// con sus propios documentos.
export default function InicioPage() {
  const { token, user } = useSession()

  const [documents, setDocuments] = React.useState<DocumentSummary[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!token) return
    let cancelled = false

    // El backend ya devuelve solo los documentos del Empleado, del más reciente al más antiguo.
    listDocuments(token)
      .then((docs) => {
        if (!cancelled) setDocuments(docs)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se pudieron cargar tus documentos.")
        }
      })

    return () => {
      cancelled = true
    }
  }, [token])

  const counts = documents ? countByStatus(documents) : null
  const recentItems =
    documents?.slice(0, RECENT_LIMIT).map((doc) => documentToRecentItem(doc, "/empleado/documentos")) ??
    null

  return (
    <div className="space-y-6">
      <DashboardHeader title="Inicio" subtitle="Tu espacio para cargar y consultar tus documentos" />

      <DashboardTopRow>
        <GreetingCard
          firstName={user?.name.split(" ")[0] ?? ""}
          question="¿Qué documento vas a registrar hoy?"
          links={QUICK_LINKS}
          action={{ to: "/empleado/cargar", label: "Cargar documento", icon: Upload }}
        />
        <RecentSection
          title="Tus últimos documentos"
          icon={FolderOpen}
          seeAllTo="/empleado/documentos"
          items={recentItems}
          error={error}
          emptyText="Todavía no has cargado documentos."
        />
      </DashboardTopRow>

      {!error && (
        <KpiGrid>
          <KpiCard label="Mis documentos" value={counts?.total ?? "..."} icon={FileText} />
          <KpiCard label="Verificados" value={counts?.verificado ?? "..."} icon={CheckCircle2} tone="success" />
          <KpiCard label="Pendientes de verificar" value={counts?.pendiente ?? "..."} icon={Clock} tone="warning" />
          <KpiCard label="Alterados" value={counts?.alterado ?? "..."} icon={AlertTriangle} tone="destructive" />
        </KpiGrid>
      )}
    </div>
  )
}
