import { Outlet } from "react-router-dom"
import { BrandLogo } from "@/components/shared/BrandLogo"

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <BrandLogo className="size-12 rounded-2xl shadow-sm" />
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
