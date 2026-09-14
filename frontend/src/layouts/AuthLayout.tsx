import { Outlet } from "react-router-dom"
import { ShieldCheck } from "lucide-react"

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-semibold">TrazaDoc</h1>
            <p className="text-sm text-muted-foreground">
              Sistema de integridad documental
            </p>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
