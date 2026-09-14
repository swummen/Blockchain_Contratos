import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
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
import { useAppData } from "@/context/AppDataContext"
import { useSession } from "@/context/SessionContext"

type ReferenceMode = "system" | "manual"

interface VerificationResult {
  matches: boolean
  referenceHash: string
  computedHash: string
  timestamp: string
}

export default function VerificarIntegridadPage() {
  const { user } = useSession()
  const { documents, verifyDocument } = useAppData()

  const [mode, setMode] = React.useState<ReferenceMode>("system")
  const [documentId, setDocumentId] = React.useState<string | null>(null)
  const [manualHash, setManualHash] = React.useState("")
  const [compareFile, setCompareFile] = React.useState<File | null>(null)
  const [result, setResult] = React.useState<VerificationResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const selectedDocument = documents.find((d) => d.documentId === documentId)
  const referenceHash = mode === "system" ? selectedDocument?.hash ?? "" : manualHash.trim()

  function handleModeChange(next: string) {
    setMode(next as ReferenceMode)
    setResult(null)
    setError(null)
  }

  function handleDocumentSelect(id: string) {
    setDocumentId(id)
    setResult(null)
    setError(null)
  }

  function handleFileSelected(file: File) {
    setCompareFile(file)
    setResult(null)
    setError(null)
  }

  async function handleVerify() {
    if (!referenceHash || !compareFile || !user) return
    setLoading(true)
    setError(null)
    const outcome = await verifyDocument(
      referenceHash,
      mode === "system" ? documentId : null,
      compareFile,
      user.name
    )
    setLoading(false)
    if (!outcome.ok || !outcome.computedHash) {
      setError(outcome.error ?? "No se pudo completar la verificación.")
      return
    }
    setResult({
      matches: outcome.status === "Verificado",
      referenceHash,
      computedHash: outcome.computedHash,
      timestamp: new Date().toISOString(),
    })
  }

  function handleReset() {
    setDocumentId(null)
    setManualHash("")
    setCompareFile(null)
    setResult(null)
    setError(null)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">
          Verificar integridad de documento
        </h1>
        <p className="text-sm text-muted-foreground">
          Compara el hash SHA-256 original con el generado a partir del documento
          actual
        </p>
      </div>

      {result ? (
        <Card>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <HashDisplay
                hash={result.referenceHash}
                canViewFull
                label="Hash original (referencia)"
              />
              <HashDisplay
                hash={result.computedHash}
                canViewFull
                label="Hash del documento actual"
              />
            </div>
            <HashCompareResult matches={result.matches} timestamp={result.timestamp} />
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
                Hash del documento original
              </p>
              <Tabs value={mode} onValueChange={handleModeChange}>
                <TabsList className="w-full">
                  <TabsTrigger value="system">Desde el sistema</TabsTrigger>
                  <TabsTrigger value="manual">Ingresar manualmente</TabsTrigger>
                </TabsList>
                <TabsContent value="system" className="space-y-3 pt-1">
                  <Select value={documentId ?? undefined} onValueChange={handleDocumentSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar documento registrado..." />
                    </SelectTrigger>
                    <SelectContent>
                      {documents.map((doc) => (
                        <SelectItem key={doc.documentId} value={doc.documentId}>
                          {doc.documentId} — {doc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedDocument && (
                    <HashDisplay
                      hash={selectedDocument.hash}
                      canViewFull
                      label="Hash SHA-256 registrado"
                    />
                  )}
                </TabsContent>
                <TabsContent value="manual" className="space-y-1.5 pt-1">
                  <Label htmlFor="manual-hash">Huella SHA-256</Label>
                  <Input
                    id="manual-hash"
                    placeholder="Pega aquí el hash de 64 caracteres"
                    value={manualHash}
                    onChange={(e) => {
                      setManualHash(e.target.value)
                      setResult(null)
                    }}
                    className="font-mono text-xs"
                  />
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-3">
              <p className="flex items-center gap-2 text-sm font-medium">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  2
                </span>
                Cargar documento a verificar
              </p>
              <FileDropzone selectedFile={compareFile} onFileSelected={handleFileSelected} />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              className="w-full"
              disabled={!referenceHash || !compareFile || loading}
              onClick={handleVerify}
            >
              {loading ? "Comparando huellas..." : "Comparar huellas SHA-256"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
