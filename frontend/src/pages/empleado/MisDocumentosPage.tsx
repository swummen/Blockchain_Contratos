import { useAppData } from "@/context/AppDataContext"
import { useSession } from "@/context/SessionContext"
import { DocumentListItem } from "@/components/shared/DocumentListItem"

export default function MisDocumentosPage() {
  const { user } = useSession()
  const { documents } = useAppData()

  const mine = documents.filter((doc) => doc.responsibleUser === user?.name)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-xl font-semibold">Mis documentos</h1>
        <p className="text-sm text-muted-foreground">
          Documentos que has cargado al sistema
        </p>
      </div>

      {mine.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Todavía no has cargado ningún documento.
        </p>
      ) : (
        <div className="space-y-3">
          {mine.map((doc) => (
            <DocumentListItem key={doc.documentId} document={doc} canViewFullHash={false} />
          ))}
        </div>
      )}
    </div>
  )
}
