import { cn } from "@/lib/utils"

// Mascota provisional de TrazaDoc: un documento con cara que sostiene un escudo
// con check (integridad verificada). Trazo de línea, como el resto de íconos.
export function DocumentMascot({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 220"
      fill="none"
      stroke="#1e293b"
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("mascot-bob drop-shadow-sm", className)}
    >
      {/* Sombra en el piso */}
      <ellipse cx="100" cy="208" rx="58" ry="7" fill="#0f172a" fillOpacity={0.08} stroke="none" />

      {/* Brazo izquierdo apoyado */}
      <path d="M50 128 C38 132 34 142 38 152" />

      {/* Hoja con la esquina doblada */}
      <path d="M50 30 H128 L156 58 V186 a10 10 0 0 1 -10 10 H60 a10 10 0 0 1 -10 -10 Z" fill="#ffffff" />
      <path d="M128 30 V50 a8 8 0 0 0 8 8 H156" fill="#e0f2fe" />

      {/* Cara: ojos cerrados y felices, mejillas y sonrisa */}
      <path d="M74 92 q7 -8 14 0" />
      <path d="M112 92 q7 -8 14 0" />
      <ellipse cx="72" cy="106" rx="8" ry="5" fill="#fda4af" fillOpacity={0.7} stroke="none" />
      <ellipse cx="128" cy="106" rx="8" ry="5" fill="#fda4af" fillOpacity={0.7} stroke="none" />
      <path d="M92 108 q8 8 16 0" />

      {/* Renglones del documento */}
      <path d="M70 140 H118" stroke="#94a3b8" strokeWidth={3.5} />
      <path d="M70 154 H108" stroke="#94a3b8" strokeWidth={3.5} />
      <path d="M70 168 H98" stroke="#94a3b8" strokeWidth={3.5} />

      {/* Brazo derecho sosteniendo el escudo */}
      <path d="M156 130 C164 132 168 138 166 146" />

      {/* Escudo con check */}
      <path
        d="M166 128 L190 136 V156 C190 172 178 182 166 188 C154 182 142 172 142 156 V136 Z"
        fill="#0a7f95"
      />
      <path d="M155 157 l8 8 l14 -16" stroke="#ffffff" strokeWidth={4.5} />
    </svg>
  )
}
