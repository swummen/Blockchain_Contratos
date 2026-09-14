import type { ContractDocument } from "@/types/domain"

export const documents: ContractDocument[] = [
  {
    documentId: "DOC-001",
    name: "Contrato_Servicios_2026.pdf",
    responsibleUser: "María López",
    registeredAt: "2026-08-08T09:14:00-05:00",
    sizeLabel: "1.2 MB",
    hash: "a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1",
    status: "Verificado",
  },
  {
    documentId: "DOC-002",
    name: "Acuerdo_Confidencialidad.pdf",
    responsibleUser: "Carlos Ruiz",
    registeredAt: "2026-08-07T14:22:00-05:00",
    sizeLabel: "0.9 MB",
    hash: "b4c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9",
    status: "Pendiente",
  },
  {
    documentId: "DOC-003",
    name: "Contrato_Laboral_Enero.pdf",
    responsibleUser: "Ana Torres",
    registeredAt: "2026-08-05T10:05:00-05:00",
    sizeLabel: "1.5 MB",
    hash: "c5d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0",
    status: "Alterado",
  },
  {
    documentId: "DOC-004",
    name: "Anexo_Servicios_Adicionales.pdf",
    responsibleUser: "María López",
    registeredAt: "2026-08-06T15:40:00-05:00",
    sizeLabel: "0.8 MB",
    hash: "d6e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1",
    status: "Pendiente",
  },
]
