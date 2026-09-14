import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileDropzone } from "@/components/shared/FileDropzone"
import { HashDisplay } from "@/components/shared/HashDisplay"
import { useAppData } from "@/context/AppDataContext"
import { useSession } from "@/context/SessionContext"
import { formatDateTime } from "@/lib/format"
import { CheckCircle2 } from "lucide-react"
import type { ContractDocument } from "@/types/domain"

export default function CargarDocumentoPage() {
  const { user } = useSession()
  const { registerDocument } = useAppData()

  const [file, setFile] = React.useState<File | null>(null)
  const [registered, setRegistered] = React.useState<ContractDocument | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  async function handleRegister() {
    if (!file || !user) return
    setLoading(true)
    setError(null)
    const result = await registerDocument(file, user.name)
    setLoading(false)
    if (!result.ok || !result.document) {
      setError(result.error ?? "No se pudo registrar el documento.")
      return
    }
    setRegistered(result.document)
  }

  function handleFileSelected(next: File) {
    setFile(next)
    setRegistered(null)
    setError(null)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">
          Cargar documento contractual
        </h1>
        <p className="text-sm text-muted-foreground">
          Sube un PDF para generar su huella criptográfica SHA-256
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <FileDropzone selectedFile={file} onFileSelected={handleFileSelected} />

          {error && <p className="text-sm text-destructive">{error}</p>}

          {registered && (
            <div className="space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="size-4" />
                Documento cargado y huella criptográfica registrada
              </div>
              <HashDisplay hash={registered.hash} canViewFull={false} />
              <p className="text-xs text-muted-foreground">
                Registrado en trazabilidad · {formatDateTime(registered.registeredAt)}
              </p>
            </div>
          )}

          <Button
            className="w-full"
            disabled={!file || loading}
            onClick={handleRegister}
          >
            {loading ? "Generando huella..." : "Cargar y generar SHA-256"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
