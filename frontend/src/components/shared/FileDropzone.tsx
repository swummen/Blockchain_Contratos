import * as React from "react"
import { Upload, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatBytes } from "@/lib/format"
import { cn } from "@/lib/utils"

interface FileDropzoneProps {
  selectedFile: File | null
  onFileSelected: (file: File) => void
}

const MAX_FILE_SIZE = 20 * 1024 * 1024

/** Valida formato PDF y tamaño ≤ 20 MB antes de aceptar el archivo (RF-12, RF-29). */
function validate(file: File): string | null {
  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  if (!isPdf) return "Solo se aceptan archivos PDF."
  if (file.size > MAX_FILE_SIZE) {
    return "El archivo supera el límite de 20 MB. Cargue un PDF de 20 MB o menos."
  }
  return null
}

export function FileDropzone({ selectedFile, onFileSelected }: FileDropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  function handleFile(file: File) {
    const validationError = validate(file)
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    onFileSelected(file)
  }

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          const file = e.dataTransfer.files?.[0]
          if (file) handleFile(file)
        }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click()
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-muted/40",
          isDragging && "border-primary bg-primary/5"
        )}
      >
        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
          <Upload className="size-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">Arrastra un archivo PDF aquí</p>
        <p className="text-xs text-muted-foreground">o haz clic para seleccionar</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-1"
          onClick={(e) => {
            e.stopPropagation()
            inputRef.current?.click()
          }}
        >
          Seleccionar archivo
        </Button>
        <p className="text-xs text-muted-foreground">Solo archivos .PDF · Máx. 20MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ""
          }}
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {selectedFile && !error && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
          <FileText className="size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatBytes(selectedFile.size)} · PDF
            </p>
          </div>
          <Badge variant="success">Listo</Badge>
        </div>
      )}
    </div>
  )
}
