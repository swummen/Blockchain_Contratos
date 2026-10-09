import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

// RF-07 (HU-003 CA-01): cerrar sesión invalida el token y redirige al inicio
// de sesión. Esta pantalla intermedia solo confirma al usuario que la
// invalidación ya ocurrió, antes de mandarlo de vuelta a LoginPage — no
// cambia el destino final que exige el requisito.
const REDIRECT_MS = 2500

export default function LoggedOutPage() {
  const navigate = useNavigate()

  React.useEffect(() => {
    const timer = setTimeout(() => navigate("/", { replace: true }), REDIRECT_MS)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle2 className="size-10 text-primary" />
        <div>
          <h2 className="font-heading text-lg font-semibold">Sesión cerrada</h2>
          <p className="text-sm text-muted-foreground">
            Tu sesión se cerró correctamente.
          </p>
        </div>
        <Button className="w-full" onClick={() => navigate("/", { replace: true })}>
          Volver a iniciar sesión
        </Button>
      </CardContent>
    </Card>
  )
}
