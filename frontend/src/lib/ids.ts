export function nextDocumentId(existingIds: string[]): string {
  const max = existingIds.reduce((acc, id) => {
    const n = Number(id.replace("DOC-", ""))
    return Number.isFinite(n) ? Math.max(acc, n) : acc
  }, 0)
  return `DOC-${String(max + 1).padStart(3, "0")}`
}

export function newTxId(): string {
  return `tx_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`
}

export function newEventId(): string {
  return `EVT-${crypto.randomUUID().slice(0, 8)}`
}
