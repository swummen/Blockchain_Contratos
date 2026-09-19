import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { OtpInput } from "@/components/shared/OtpInput"
import { useSession } from "@/context/SessionContext"
import { Mail, RotateCcw } from "lucide-react"

const ROLE_LABEL: Record<string, string> = {
  Empleado: "EMPLEADO / FIRMANTE",
  Verificador: "VERIFICADOR",
  Administrador: "ADMINISTRADOR",
}

function maskEmail(email: string): string {
  const [user, domain] = email.split("@")
  if (!domain) return email
  const visible = user.slice(0, 3)
  return `${visible}${"*".repeat(Math.max(user.length - 3, 3))}@${domain}`
}

const ROLE_HOME: Record<string, string> = {
  Empleado: "/empleado",
  Verificador: "/verificador",
  Administrador: "/administrador",
}

export default function OtpPage() {
  const navigate = useNavigate()
  const { stage, user, pendingRole, pendingEmail, verifyOtp } = useSession()

  const [code, setCode] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (stage === "authenticated" && user) {
      navigate(ROLE_HOME[user.role], { replace: true })
    } else if (stage === "anonymous") {
      navigate("/", { replace: true })
    }
  }, [stage, user, navigate])

  if (!pendingRole || !pendingEmail) return null

  async function handleVerify() {
    setIsSubmitting(true)
    const result = await verifyOtp(code)
    setIsSubmitting(false)
    if (!result.ok) {
      setError(result.error ?? "No se pudo verificar el código.")
      return
    }
    setError(null)
  }

  return (
    <div className="space-y-4 text-center">
      <div>
        <h2 className="font-heading text-lg font-semibold">Verificación de acceso</h2>
        <p className="text-sm text-muted-foreground">
          Ingresa el código enviado a tu correo registrado
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 text-left">
          <div className="flex justify-center">
            <Badge variant="outline">ROL: {ROLE_LABEL[pendingRole]}</Badge>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Mail className="size-4" />
            Código enviado a {maskEmail(pendingEmail)}
          </div>

          <OtpInput value={code} onChange={setCode} />

          <p className="text-center text-xs text-muted-foreground">
            {code.length}/6 dígitos
          </p>

          {error && (
            <p className="text-center text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button
            className="w-full"
            disabled={code.length !== 6 || isSubmitting}
            onClick={handleVerify}
          >
            {isSubmitting ? "Verificando..." : "Verificar código"}
          </Button>

          <button
            type="button"
            onClick={() => setCode("")}
            className="mx-auto flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <RotateCcw className="size-3.5" />
            Reenviar código
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
