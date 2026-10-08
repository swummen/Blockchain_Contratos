import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileDropzone } from "@/components/shared/FileDropzone"
import { HashDisplay } from "@/components/shared/HashDisplay"
import { HashCompareResult } from "@/components/shared/HashCompareResult"
import { useSession } from "@/context/SessionContext"
import { getDocument, verifyDocument, type DocumentLookup, type VerifyDocumentResult } from "@/lib/api"
import { formatDateTime } from "@/lib/format"

export default function VerificarIntegridadPage() {
  const { token } = useSession()

  const [documentIdInput, setDocumentIdInput] = React.useState("")
  const [document, setDocument] = React.useState<DocumentLookup | null>(null)
  const [lookupError, setLookupError] = React.useState<string | null>(null)
  const [lookupLoading, setLookupLoading] = React.useState(false)

  const [compareFile, setCompareFile] = React.useState<File | null>(null)
  const [result, setResult] = React.useState<VerifyDocumentResult | null>(null)
  const [verifyError, setVerifyError] = React.useState<string | null>(null)
  const [verifyLoading, setVerifyLoading] = React.useState(false)

  // Sin listado de documentos todavía (Sprint 4, RF-37...40) — se busca por
  // el identificador exacto (RF-25), no se elige de una lista (HU-010-CA-01).
  async function handleLookup() {
    const id = documentIdInput.trim()
    if (!id || !token) return
    setLookupLoading(true)
    setLookupError(null)
    setDocument(null)
    setResult(null)
    setVerifyError(null)
    try {
      setDocument(await getDocument(token, id))
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : "No se pudo consultar el documento.")
    } finally {
      setLookupLoading(false)
    }
  }

  function handleFileSelected(file: File) {
    setCompareFile(file)
    setResult(null)
    setVerifyError(null)
  }

  async function handleVerify() {
    if (!document || !compareFile || !token) return
    setVerifyLoading(true)
    setVerifyError(null)
    try {
      setResult(await verifyDocument(token, document.documentId, compareFile))
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : "No se pudo completar la verificación.")
    } finally {
      setVerifyLoading(false)
    }
  }

  // HU-014-CA-02: "Nueva verificación" vuelve al formulario vacío de
  // selección de documento, no solo limpia el resultado.
  function handleReset() {
    setDocumentIdInput("")
    setDocument(null)
    setLookupError(null)
    setCompareFile(null)
    setResult(null)
    setVerifyError(null)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">
          Verificar integridad de documento
        </h1>
        <p className="text-sm text-muted-foreground">
          Compara la huella SHA-256 registrada con la generada a partir del documento actual
        </p>
      </div>

      {result ? (
        <Card>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <HashDisplay hash={result.registeredHash} canViewFull label="Hash registrado" />
              <HashDisplay
                hash={result.computedHash}
                canViewFull
                label="Hash del documento actual"
              />
            </div>
            <HashCompareResult matches={result.matches} timestamp={new Date().toISOString()} />
            <Button className="w-full" variant="outline" onClick={handleReset}>
              Nueva verificación
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-sm font-medium">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  1
                </span>
                Documento a verificar
              </p>
              <form
                className="space-y-1.5"
                onSubmit={(e) => {
                  e.preventDefault()
                  handleLookup()
                }}
              >
                <Label htmlFor="document-id">Identificador del documento</Label>
                <div className="flex gap-2">
                  <Input
                    id="document-id"
                    placeholder="Pega aquí el identificador del documento"
                    value={documentIdInput}
                    onChange={(e) => setDocumentIdInput(e.target.value)}
                    className="font-mono text-xs"
                    disabled={!!document || lookupLoading}
                  />
                  {!document && (
                    <Button
                      type="submit"
                      variant="outline"
                      disabled={!documentIdInput.trim() || lookupLoading}
                    >
                      {lookupLoading ? "Buscando..." : "Buscar"}
                    </Button>
                  )}
                </div>
                {lookupError && <p className="text-xs text-destructive">{lookupError}</p>}
              </form>

              {document && (
                <div className="space-y-3 rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      {document.name && <p className="text-sm font-medium">{document.name}</p>}
                      {document.registeredAt && (
                        <p className="text-xs text-muted-foreground">
                          Registrado · {formatDateTime(document.registeredAt)}
                        </p>
                      )}
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
                      Cambiar
                    </Button>
                  </div>
                  <HashDisplay hash={document.hash} canViewFull label="Hash SHA-256 registrado" />
                </div>
              )}
            </div>

            {document && (
              <div className="space-y-3">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    2
                  </span>
                  Cargar documento a verificar
                </p>
                <FileDropzone selectedFile={compareFile} onFileSelected={handleFileSelected} />
              </div>
            )}

            {verifyError && <p className="text-sm text-destructive">{verifyError}</p>}

            {document && (
              <Button
                className="w-full"
                disabled={!compareFile || verifyLoading}
                onClick={handleVerify}
              >
                {verifyLoading ? "Comparando huellas..." : "Comparar huellas SHA-256"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
