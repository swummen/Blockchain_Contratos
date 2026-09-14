import { maskHash } from "@/lib/mask-hash"
import { cn } from "@/lib/utils"

interface HashDisplayProps {
  hash: string
  /**
   * Único interruptor que decide si se imprime el hash completo o enmascarado.
   * RF-27/RNF-08: la huella completa solo puede verla Verificador y Administrador.
   * Ninguna pantalla debe interpolar `document.hash` fuera de este componente.
   */
  canViewFull: boolean
  label?: string
  className?: string
}

export function HashDisplay({
  hash,
  canViewFull,
  label = "SHA-256",
  className,
}: HashDisplayProps) {
  const shown = canViewFull ? hash : maskHash(hash)

  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-xs font-medium text-muted-foreground">
        {label}
        {!canViewFull && " (parcial)"}
      </p>
      <code className="block truncate rounded-md bg-muted px-2.5 py-1.5 font-mono text-xs text-foreground/80">
        {shown}
      </code>
      {!canViewFull && (
        <p className="text-xs text-muted-foreground">
          La huella completa es gestionada por el Verificador y el Administrador
          (RF-27).
        </p>
      )}
    </div>
  )
}
