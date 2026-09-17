import { Routes, Route, Navigate } from "react-router-dom"
import AuthLayout from "@/layouts/AuthLayout"
import RoleLayout from "@/layouts/RoleLayout"
import { ProtectedRoute } from "./ProtectedRoute"

import LoginPage from "@/pages/LoginPage"
import OtpPage from "@/pages/OtpPage"

import CargarDocumentoPage from "@/pages/empleado/CargarDocumentoPage"
import MisDocumentosPage from "@/pages/empleado/MisDocumentosPage"
import MiTrazabilidadPage from "@/pages/empleado/MiTrazabilidadPage"

import VerificarIntegridadPage from "@/pages/verificador/VerificarIntegridadPage"
import DocumentosVerificadorPage from "@/pages/verificador/DocumentosPage"
import TrazabilidadGlobalPage from "@/pages/verificador/TrazabilidadGlobalPage"

import DashboardPage from "@/pages/administrador/DashboardPage"
import UsuariosPage from "@/pages/administrador/UsuariosPage"
import DocumentosAdminPage from "@/pages/administrador/DocumentosPage"
import TrazabilidadAdminPage from "@/pages/administrador/TrazabilidadPage"
import SystemStatusPage from "@/pages/SystemStatusPage"

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/" element={<LoginPage />} />
        <Route path="/verificacion" element={<OtpPage />} />
      </Route>

      {/* Diagnóstico de infraestructura (T6, HU-021 CA-02), no forma parte
          del flujo de negocio: sin layout ni sesión. */}
      <Route path="/system-status" element={<SystemStatusPage />} />

      <Route element={<ProtectedRoute allowedRole="Empleado" />}>
        <Route element={<RoleLayout />}>
          <Route path="/empleado" element={<Navigate to="/empleado/cargar" replace />} />
          <Route path="/empleado/cargar" element={<CargarDocumentoPage />} />
          <Route path="/empleado/documentos" element={<MisDocumentosPage />} />
          <Route path="/empleado/trazabilidad" element={<MiTrazabilidadPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRole="Verificador" />}>
        <Route element={<RoleLayout />}>
          <Route
            path="/verificador"
            element={<Navigate to="/verificador/verificar" replace />}
          />
          <Route path="/verificador/verificar" element={<VerificarIntegridadPage />} />
          <Route path="/verificador/documentos" element={<DocumentosVerificadorPage />} />
          <Route path="/verificador/trazabilidad" element={<TrazabilidadGlobalPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRole="Administrador" />}>
        <Route element={<RoleLayout />}>
          <Route
            path="/administrador"
            element={<Navigate to="/administrador/dashboard" replace />}
          />
          <Route path="/administrador/dashboard" element={<DashboardPage />} />
          <Route path="/administrador/usuarios" element={<UsuariosPage />} />
          <Route path="/administrador/documentos" element={<DocumentosAdminPage />} />
          <Route path="/administrador/trazabilidad" element={<TrazabilidadAdminPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
