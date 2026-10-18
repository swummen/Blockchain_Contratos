import * as React from "react"
import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Sin permiso de clipboard o navegador sin la API, el valor ya está
      // visible y seleccionable a mano, así que no hace falta un fallback.
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
      <Copy className="size-3.5" />
      {copied ? "Copiado" : "Copiar"}
    </Button>
  )
}
