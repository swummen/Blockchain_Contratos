import * as React from "react"
import { Link } from "react-router-dom"
import { CalendarDays, ChevronRight, type LucideIcon } from "lucide-react"
import { DocumentMascot } from "@/components/shared/DocumentMascot"
import { cn } from "@/lib/utils"

// Piezas comunes de las pantallas de inicio de los tres roles, para que se vean
// en armonía (mismo encabezado, saludo con mascota y tarjetas de lo reciente).

export function DashboardHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const today = new Date().toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <span className="inline-flex h-9 w-fit items-center gap-2 rounded-full bg-slate-50 px-3.5 text-sm text-slate-600 ring-1 ring-slate-200">
        <CalendarDays className="size-4 text-slate-400" />
        {today}
      </span>
    </header>
  )
}

export interface QuickLink {
  to: string
  label: string
  icon: LucideIcon
  /** Color del ícono y de su aro, p. ej. "text-sky-600 ring-sky-200". */
  tone: string
}

interface GreetingCardProps {
  firstName: string
  question: string
  links: QuickLink[]
  /** Botón principal opcional (la tarea más común del rol). */
  action?: { to: string; label: string; icon: LucideIcon }
}

// Saludo con accesos rápidos; la mascota se asoma por encima de la tarjeta.
export function GreetingCard({ firstName, question, links, action }: GreetingCardProps) {
  return (
    // En pantallas muy anchas va al lado de RecentSection: arranca donde empieza
    // su primera tarjeta (1.5rem de margen + 1.5rem del título + 0.75rem de
    // espacio = 3.75rem) y se estira hasta el final de la última.
    <section className="relative flex min-w-0 flex-col justify-center rounded-[1.5rem] bg-gradient-to-br from-sky-50 via-white to-white p-6 shadow-[0_0_0_1px_rgb(226_232_240/0.8),0_12px_24px_-16px_rgb(15_23_42/0.25)] sm:mt-8 sm:p-8 2xl:col-span-2 2xl:mt-[3.75rem]">
      <DocumentMascot className="pointer-events-none absolute -top-12 right-4 hidden w-36 sm:block md:right-10 md:w-44" />

      <div className="sm:pr-40 md:pr-56">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          ¡Hola, {firstName}!
        </h2>
        <p className="mt-2 text-sm text-slate-500">{question}</p>

        <ul className="mt-6 grid max-w-md gap-x-6 gap-y-3 sm:grid-cols-2">
          {links.map(({ to, label, icon: Icon, tone }) => (
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

        {action && (
          <Link
            to={action.to}
            className="btn-3d mt-6 inline-flex h-10 items-center gap-2 bg-sidebar px-5 text-sm text-white [--btn-edge:color-mix(in_oklch,var(--sidebar),black_35%)]"
          >
            <action.icon className="size-4" />
            {action.label}
          </Link>
        )}
      </div>
    </section>
  )
}

interface RecentSectionProps {
  title: string
  icon: LucideIcon
  seeAllTo: string
  /** null mientras carga. */
  items: RecentItem[] | null
  error: string | null
  emptyText: string
}

export interface RecentItem {
  key: string
  to: string
  icon: LucideIcon
  /** Fondo del cuadro del ícono, p. ej. "bg-emerald-500". */
  tile: string
  title: string
  detail: string
  meta: string
}

// Lo reciente como tarjetas de notificación: al lado del saludo en pantallas
// muy anchas y debajo, en tres columnas, en el resto.
export function RecentSection({
  title,
  icon: TitleIcon,
  seeAllTo,
  items,
  error,
  emptyText,
}: RecentSectionProps) {
  return (
    <section className="min-w-0 space-y-3 2xl:mt-6">
      {/* Alto fijo (1.5rem): GreetingCard lo usa para alinearse con las tarjetas. */}
      <div className="flex h-6 items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
          <TitleIcon className="size-4 text-slate-400" />
          {title}
        </h2>
        <Link
          to={seeAllTo}
          className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          Ver todo
        </Link>
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : items === null ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-3 2xl:grid-cols-1">
          {items.map(({ key, to, icon: Icon, tile, title: itemTitle, detail, meta }) => (
            <li key={key} className="min-w-0">
              <Link to={to} className="group dashboard-card flex items-center gap-3 p-3.5">
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
                    {itemTitle}
                  </span>
                  <span className="block truncate text-xs text-slate-500">{detail}</span>
                  <span className="block text-[11px] text-slate-400">{meta}</span>
                </span>
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full text-slate-400 ring-1 ring-slate-200 transition-colors group-hover:text-slate-700">
                  <ChevronRight className="size-3.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

// Saludo y lo reciente: lado a lado solo en pantallas muy anchas, con la misma
// altura (items-stretch) para que sus bordes queden alineados.
export function DashboardTopRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-6 2xl:grid-cols-3 2xl:items-stretch">{children}</div>
}

export function KpiGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">{children}</div>
}
