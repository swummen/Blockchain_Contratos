import { useAppData } from "@/context/AppDataContext"
import { DocumentListItem } from "@/components/shared/DocumentListItem"

export default function DocumentosPage() {
  const { documents } = useAppData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">Documentos registradoss</h1>
        <p className="text-sm text-muted-foreground">
          Huellas criptográficas SHA-256 generadas
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
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
