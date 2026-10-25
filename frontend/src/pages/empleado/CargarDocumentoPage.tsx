import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileDropzone } from "@/components/shared/FileDropzone"
import { HashDisplay } from "@/components/shared/HashDisplay"
import { CopyButton } from "@/components/shared/CopyButton"
import { useSession } from "@/context/SessionContext"
import { uploadDocument } from "@/lib/api"
import { computeSha256Hex } from "@/lib/sha256"
import { formatBytes, formatDateTime } from "@/lib/format"
import { CheckCircle2 } from "lucide-react"
import type { ContractDocument } from "@/types/domain"

export default function CargarDocumentoPage() {
  const { user, token } = useSession()

  const [file, setFile] = React.useState<File | null>(null)
  const [registered, setRegistered] = React.useState<ContractDocument | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  async function handleRegister() {
    if (!file || !user || !token) return
    setLoading(true)
    setError(null)
    try {
      // El backend calcula su propia huella; esta es solo para mostrarla. Va
      // primero: si falla (crypto.subtle no existe sin HTTPS), nada se registró.
      const hash = await computeSha256Hex(file)
      const result = await uploadDocument(token, file)
      setRegistered({
        documentId: result.documentId,
        name: file.name,
        responsibleUser: user.name,
        registeredAt: new Date().toISOString(),
        sizeLabel: formatBytes(file.size),
        hash,
        status: "Pendiente",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar el documento.")
    } finally {
      setLoading(false)
    }
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
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Identificador del documento
                </p>
                <div className="flex items-center gap-2">
                  <code className="block flex-1 truncate rounded-md bg-muted px-2.5 py-1.5 font-mono text-xs text-foreground/80">
                    {registered.documentId}
                  </code>
                  <CopyButton value={registered.documentId} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Compartí este identificador con el Verificador, o va a poder elegirlo
                  directo del listado de documentos registrados.
                </p>
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
