import logoUrl from "@/assets/logo-trazadoc.png"
import { cn } from "@/lib/utils"

// Logo del MVP (claude_docs/imgs.docx, imagen 1). Su fondo blanco se cambió por
// el azul oscuro de la imagen de inicio (#043263). El tamaño y el redondeo los
// pone quien lo usa.
export function BrandLogo({ className }: { className?: string }) {
  return (
    <img
      src={logoUrl}
      alt="Logo de TrazaDoc"
      className={cn("shrink-0 bg-[#043263] object-contain", className)}
    />
  )
}
