import logoUrl from "@/assets/logo-trazadoc.png"
import { cn } from "@/lib/utils"

// Logo del MVP (carpetas en fila, imagen enviada por Sofia). Su fondo blanco se cambió por
// el azul oscuro de la imagen de inicio (#043263). El tamaño y el redondeo los
// pone quien lo usa; la imagen ocupa el 72 % del cuadro para dejar margen azul.
export function BrandLogo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden bg-[#043263]",
        className
      )}
    >
      <img src={logoUrl} alt="Logo de TrazaDoc" className="size-[72%] object-contain" />
    </div>
  )
}
