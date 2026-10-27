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

interface Person {
  id: string
  name: string
  documents: DocumentSummary[]
}

export default function VerificarIntegridadPage() {
  const { token } = useSession()

  // Selección en dos pasos (RF-24): primero la persona y luego su contrato,
  // para que dos archivos con el mismo nombre de personas distintas no se
  // confundan. El identificador a mano queda para documentos fuera del listado.
  const [documents, setDocuments] = React.useState<DocumentSummary[]>([])
  const [documentsError, setDocumentsError] = React.useState<string | null>(null)

  const [selectedPersonId, setSelectedPersonId] = React.useState<string | null>(null)
  const [manualOpen, setManualOpen] = React.useState(false)

  const [documentIdInput, setDocumentIdInput] = React.useState("")
  const [document, setDocument] = React.useState<DocumentLookup | null>(null)
  const [lookupError, setLookupError] = React.useState<string | null>(null)
  const [lookupLoading, setLookupLoading] = React.useState(false)

  const [compareFile, setCompareFile] = React.useState<File | null>(null)
  const [result, setResult] = React.useState<VerifyDocumentResult | null>(null)
  const [verifyError, setVerifyError] = React.useState<string | null>(null)
  const [verifyLoading, setVerifyLoading] = React.useState(false)

  // Sube con cada "Nueva verificación" para recargar estados ya cambiados.
  const [listVersion, setListVersion] = React.useState(0)

  React.useEffect(() => {
    if (!token) return
    listDocuments(token)
      .then(setDocuments)
      .catch((err) => {
        // No bloqueante: si falla, queda la búsqueda manual por identificador.
        setDocumentsError(err instanceof Error ? err.message : "No se pudo cargar el listado.")
      })
  }, [token, listVersion])

  // Personas del paso 1; el documentId queda interno.
  const people = React.useMemo<Person[]>(() => {
    const byId = new Map<string, Person>()
    for (const doc of documents) {
      const person = byId.get(doc.responsibleUser) ?? {
        id: doc.responsibleUser,
        name: doc.responsibleName,
        documents: [],
      }
      person.documents.push(doc)
      byId.set(doc.responsibleUser, person)
    }
    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name))
  }, [documents])

  const selectedPerson = people.find((p) => p.id === selectedPersonId) ?? null

  // Del listado; si se buscó a mano y no está en él, cae al userId.
  const selectedResponsibleName =
    documents.find((d) => d.documentId === document?.documentId)?.responsibleName ??
    document?.responsibleUser

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

  // "Nueva verificación" vuelve a la selección vacía (HU-014 CA-02).
  function handleReset() {
    setSelectedPersonId(null)
    setManualOpen(false)
    setDocumentIdInput("")
    setDocument(null)
    setLookupError(null)
    setCompareFile(null)
    setResult(null)
    setVerifyError(null)
    setListVersion((v) => v + 1)
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
            {/* RF-33: evidencia de qué documento se comparó contra qué archivo. */}
            <div className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Documento registrado</p>
                <p className="font-medium">{document?.name ?? document?.documentId}</p>
                {selectedResponsibleName && (
                  <p className="text-xs text-muted-foreground">{selectedResponsibleName}</p>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Archivo cargado para comparar</p>
                <p className="font-medium">{compareFile?.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

              {!document && (
                <>
                  {people.length > 0 && (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="person-select">Persona responsable</Label>
                        <Select
                          value={selectedPersonId ?? undefined}
                          onValueChange={setSelectedPersonId}
                          disabled={lookupLoading}
                        >
                          <SelectTrigger id="person-select">
                            <SelectValue placeholder="Elige a la persona que registró el documento..." />
                          </SelectTrigger>
                          <SelectContent>
                            {people.map((person) => (
                              <SelectItem key={person.id} value={person.id}>
                                {person.name} · {person.documents.length}{" "}
                                {person.documents.length === 1 ? "documento" : "documentos"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedPerson && (
                        <div className="space-y-1.5">
                          <Label htmlFor="document-select">
                            Contrato de {selectedPerson.name}
                          </Label>
                          <Select
                            // Sin valor: elegir dispara handleLookup y oculta este bloque.
                            value={undefined}
                            onValueChange={(id) => handleLookup(id)}
                            disabled={lookupLoading}
                          >
                            <SelectTrigger id="document-select">
                              <SelectValue placeholder="Elige el contrato a verificar..." />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedPerson.documents.map((doc) => (
                                <SelectItem key={doc.documentId} value={doc.documentId}>
                                  {doc.name} · {formatDateTime(doc.registeredAt)} · {doc.status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}

                  {documentsError && (
                    <p className="text-xs text-muted-foreground">
                      No se pudo cargar el listado ({documentsError}): ingresa el identificador abajo.
                    </p>
                  )}

                  {/* Vía secundaria: ingresar el identificador a mano. */}
                  <div className="pt-1">
                    {!manualOpen ? (
                      <button
                        type="button"
                        onClick={() => setManualOpen(true)}
                        className="text-xs text-primary hover:underline"
                      >
                        ¿No lo encuentras? Ingresa el identificador a mano
                      </button>
                    ) : (
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
                            disabled={lookupLoading}
                          />
                          <Button
                            type="submit"
                            variant="outline"
                            disabled={!documentIdInput.trim() || lookupLoading}
                          >
                            {lookupLoading ? "Buscando..." : "Buscar"}
                          </Button>
                        </div>
                        {lookupError && <p className="text-xs text-destructive">{lookupError}</p>}
                      </form>
                    )}
                    {!manualOpen && lookupError && (
                      <p className="mt-1 text-xs text-destructive">{lookupError}</p>
                    )}
                  </div>
                </>
              )}

              {document && (
                <div className="space-y-3 rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      {document.name && <p className="text-sm font-medium">{document.name}</p>}
                      {selectedResponsibleName && (
                        <p className="text-xs text-muted-foreground">
                          Responsable · {selectedResponsibleName}
                        </p>
                      )}
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
