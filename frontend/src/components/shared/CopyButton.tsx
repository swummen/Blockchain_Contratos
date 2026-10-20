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
      // Sin acceso al portapapeles: el valor sigue visible para copiarlo a mano.
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
      <Copy className="size-3.5" />
      {copied ? "Copiado" : "Copiar"}
    </Button>
  )
}
