import * as React from "react"
import { Link } from "react-router-dom"
import { useSession } from "@/context/SessionContext"
import { DocumentMascot } from "@/components/shared/DocumentMascot"
import { KpiCard } from "@/components/shared/KpiCard"
import {
  getAllEvents,
  getDocumentsSummary,
  listDocuments,
  type DocumentEvent,
  type DocumentsSummary,
} from "@/lib/api"
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  History,
  ShieldAlert,
  ShieldCheck,
  Upload,
  Users,
  type LucideIcon,
} from "lucide-react"

const RECENT_LIMIT = 3

// Accesos rápidos de la tarjeta de saludo.
const QUICK_LINKS: { to: string; label: string; icon: LucideIcon; tone: string }[] = [
  {
    to: "/administrador/usuarios",
    label: "Gestionar usuarios",
    icon: Users,
    tone: "text-sky-600 ring-sky-200",
  },
  {
    to: "/administrador/documentos",
    label: "Ver documentos",
    icon: FileText,
    tone: "text-amber-500 ring-amber-200",
  },
  {
    to: "/administrador/trazabilidad",
    label: "Revisar trazabilidad",
    icon: History,
    tone: "text-emerald-600 ring-emerald-200",
  },
  {
    to: "/administrador/documentos",
    label: "Documentos alterados",
    icon: AlertTriangle,
    tone: "text-rose-600 ring-rose-200",
  },
]

// Cómo se muestra cada evento como tarjeta de notificación.
function describeEvent(event: DocumentEvent, documentName: string) {
  if (event.action === "registro") {
    return {
      icon: Upload,
      tile: "bg-amber-400",
      title: `${event.userName} cargó un documento`,
      detail: documentName,
    }
  }
  if (event.result === "comprometida") {
    return {
      icon: ShieldAlert,
      tile: "bg-rose-500",
      title: "Se detectó una alteración",
      detail: `${documentName} · verificó ${event.userName}`,
    }
  }
  return {
    icon: ShieldCheck,
    tile: "bg-emerald-500",
    title: `${event.userName} verificó un documento`,
    detail: `${documentName} · íntegro`,
  }
}

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

  const firstName = user?.name.split(" ")[0] ?? ""
  const today = new Date().toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Vista general del estado documental</p>
        </div>
        <span className="inline-flex h-9 w-fit items-center gap-2 rounded-full bg-slate-50 px-3.5 text-sm text-slate-600 ring-1 ring-slate-200">
          <CalendarDays className="size-4 text-slate-400" />
          {today}
        </span>
      </header>

      {/* Saludo y actividad lado a lado solo en pantallas muy anchas; antes la
          actividad pasa debajo, en tres columnas. */}
      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-3 2xl:items-start">
        {/* Saludo con accesos rápidos; la mascota se asoma por encima de la tarjeta. */}
        <section className="relative min-w-0 rounded-[1.5rem] bg-gradient-to-br from-sky-50 via-white to-white p-6 shadow-[0_0_0_1px_rgb(226_232_240/0.8),0_12px_24px_-16px_rgb(15_23_42/0.25)] sm:mt-10 sm:p-8 2xl:col-span-2">
          <DocumentMascot className="pointer-events-none absolute -top-12 right-4 hidden w-36 sm:block md:right-10 md:w-44" />

          <div className="sm:pr-40 md:pr-56">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              ¡Hola, {firstName}!
            </h2>
            <p className="mt-2 text-sm text-slate-500">¿Qué vamos a revisar hoy?</p>

            <ul className="mt-6 grid max-w-md gap-x-6 gap-y-3 sm:grid-cols-2">
              {QUICK_LINKS.map(({ to, label, icon: Icon, tone }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="group inline-flex items-center gap-2.5 text-sm text-slate-600 transition-colors hover:text-slate-900"
                  >
                    <span
                      className={cn(
                        "flex size-7 items-center justify-center rounded-full bg-white ring-1 transition-transform duration-200 group-hover:scale-110",
                        tone
                      )}
                    >
                      <Icon className="size-3.5" strokeWidth={2} />
                    </span>
                    <span className="whitespace-nowrap underline-offset-4 group-hover:underline">
                      {label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Actividad reciente como tarjetas de notificación. */}
        <section className="min-w-0 space-y-3 2xl:mt-10">
          <div className="flex items-center justify-between">
            <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Bell className="size-4 text-slate-400" />
              Actividad reciente
            </h2>
            <Link
              to="/administrador/trazabilidad"
              className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
            >
              Ver todo
            </Link>
          </div>

          {recentError ? (
            <p className="text-sm text-destructive">{recentError}</p>
          ) : recent === null ? (
            <p className="text-sm text-muted-foreground">Cargando actividad…</p>
          ) : recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todavía no hay acciones registradas.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-3 2xl:grid-cols-1">
              {recent.map((event) => {
                const name = documentNames[event.documentId] ?? event.documentId
                const { icon: Icon, tile, title, detail } = describeEvent(event, name)
                return (
                  <li key={event.txId} className="min-w-0">
                    <Link
                      to="/administrador/trazabilidad"
                      className="group dashboard-card flex items-center gap-3 p-3.5"
                    >
                      <span
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-xl text-white",
                          tile
                        )}
                      >
                        <Icon className="size-5" strokeWidth={1.75} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 text-sm leading-snug font-medium text-slate-900">
                          {title}
                        </span>
                        <span className="block truncate text-xs text-slate-500">{detail}</span>
                        <span className="block text-[11px] text-slate-400">
                          {formatDateTime(event.timestamp)}
                        </span>
                      </span>
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full text-slate-400 ring-1 ring-slate-200 transition-colors group-hover:text-slate-700">
                        <ChevronRight className="size-3.5" />
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      {summaryError ? (
        <p className="text-sm text-destructive">{summaryError}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <KpiCard label="Total de documentos" value={summary?.total ?? "..."} icon={FileText} />
          <KpiCard
            label="Documentos verificados"
            value={summary?.verificado ?? "..."}
            icon={CheckCircle2}
            tone="success"
          />
          <KpiCard
            label="Pendientes de verificar"
            value={summary?.pendiente ?? "..."}
            icon={Clock}
            tone="warning"
          />
          <KpiCard
            label="Documentos alterados"
            value={summary?.alterado ?? "..."}
            icon={AlertTriangle}
            tone="destructive"
          />
        </div>
      )}
    </div>
  )
}
