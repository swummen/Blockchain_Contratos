import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { FileDropzone } from "@/components/shared/FileDropzone"
import { HashDisplay } from "@/components/shared/HashDisplay"
import { HashCompareResult } from "@/components/shared/HashCompareResult"
import { useSession } from "@/context/SessionContext"
import {
  getDocument,
  listDocuments,
  verifyDocument,
  type DocumentLookup,
  type DocumentSummary,
  type VerifyDocumentResult,
} from "@/lib/api"
import { formatDateTime } from "@/lib/format"

export default function VerificarIntegridadPage() {
  const { token } = useSession()

  // HU-010-CA-01: "el Verificador lo selecciona" — de una lista si hay una
  // (ampliación de alcance de Sprint 3 T5) o ingresando el identificador
  // directo (siempre disponible, por si el documento no aparece en esta
  // primera página de 100 o la lista no cargó).
  const [documents, setDocuments] = React.useState<DocumentSummary[]>([])
  const [documentsError, setDocumentsError] = React.useState<string | null>(null)

  const [documentIdInput, setDocumentIdInput] = React.useState("")
  const [document, setDocument] = React.useState<DocumentLookup | null>(null)
  const [lookupError, setLookupError] = React.useState<string | null>(null)
  const [lookupLoading, setLookupLoading] = React.useState(false)

  const [compareFile, setCompareFile] = React.useState<File | null>(null)
  const [result, setResult] = React.useState<VerifyDocumentResult | null>(null)
  const [verifyError, setVerifyError] = React.useState<string | null>(null)
  const [verifyLoading, setVerifyLoading] = React.useState(false)

  React.useEffect(() => {
    if (!token) return
    listDocuments(token)
      .then(setDocuments)
      .catch((err) => {
        // No bloqueante: si falla, queda la búsqueda manual por identificador.
        setDocumentsError(err instanceof Error ? err.message : "No se pudo cargar el listado.")
      })
  }, [token])

  async function handleLookup(idToLookup?: string) {
    const id = (idToLookup ?? documentIdInput).trim()
    if (!id || !token) return
    setDocumentIdInput(id)
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

              {!document && documents.length > 0 && (
                <div className="space-y-1.5">
                  <Label htmlFor="document-select">Elegir de los documentos registrados</Label>
                  <Select
                    // Siempre sin seleccionar a propósito: elegir una opción
                    // dispara handleLookup, que pone `document` y esconde
                    // todo este bloque — nunca llega a quedar "elegido".
                    value={undefined}
                    onValueChange={(id) => handleLookup(id)}
                    disabled={lookupLoading}
                  >
                    <SelectTrigger id="document-select">
                      <SelectValue placeholder="Seleccionar documento registrado..." />
                    </SelectTrigger>
                    <SelectContent>
                      {documents.map((doc) => (
                        <SelectItem key={doc.documentId} value={doc.documentId}>
                          {doc.name} — {doc.status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">o ingresá el identificador directo:</p>
                </div>
              )}
              {!document && documentsError && (
                <p className="text-xs text-muted-foreground">
                  No se pudo cargar el listado ({documentsError}) — buscá por identificador.
                </p>
              )}

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
