import type { TraceEvent } from "@/types/domain"

export const events: TraceEvent[] = [
  {
    eventId: "EVT-001",
    documentId: "DOC-001",
    action: "registro",
    user: "María López",
    txId: "tx_a1b2c3d4e5f6",
    timestamp: "2026-08-08T09:14:00-05:00",
  },
  {
    eventId: "EVT-002",
    documentId: "DOC-001",
    action: "verificacion",
    user: "Pedro Gómez",
    txId: "tx_c3d4e5f6a1b2",
    timestamp: "2026-08-09T11:30:00-05:00",
    result: "confirmada",
  },
  {
    eventId: "EVT-003",
    documentId: "DOC-002",
    action: "registro",
    user: "Carlos Ruiz",
    txId: "tx_d4e5f6a1b2c3",
    timestamp: "2026-08-07T14:22:00-05:00",
  },
  {
    eventId: "EVT-004",
    documentId: "DOC-003",
    action: "registro",
    user: "Ana Torres",
    txId: "tx_e5f6a1b2c3d4",
    timestamp: "2026-08-05T10:05:00-05:00",
  },
  {
    eventId: "EVT-005",
    documentId: "DOC-003",
    action: "verificacion",
    user: "Pedro Gómez",
    txId: "tx_f6a1b2c3d4e5",
    timestamp: "2026-08-06T08:47:00-05:00",
    result: "comprometida",
  },
  {
    eventId: "EVT-006",
    documentId: "DOC-004",
    action: "registro",
    user: "María López",
    txId: "tx_b2c3d4e5f6a1",
    timestamp: "2026-08-06T15:40:00-05:00",
  },
]
