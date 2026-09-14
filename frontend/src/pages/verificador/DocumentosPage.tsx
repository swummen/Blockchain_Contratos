import { useAppData } from "@/context/AppDataContext"
import { DocumentListItem } from "@/components/shared/DocumentListItem"

export default function DocumentosPage() {
  const { documents } = useAppData()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">Todos los documentos</h1>
        <p className="text-sm text-muted-foreground">
          Vista de solo lectura de documentos registrados
        </p>
      </div>

      <div className="space-y-3">
        {documents.map((doc) => (
          <DocumentListItem
            key={doc.documentId}
            document={doc}
            canViewFullHash
            showResponsible
          />
        ))}
      </div>
    </div>
  )
}
