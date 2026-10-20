/**
 * Deja visibles los primeros y últimos 8 caracteres (RF-27).
 * Mismo algoritmo que maskHash en backend/src/services/documentService.ts.
 */
export function maskHash(hash: string): string {
  if (hash.length <= 20) return hash
  const head = hash.slice(0, 8)
  const tail = hash.slice(-8)
  const dotCount = Math.min(hash.length - 16, 20)
  return `${head}${"•".repeat(dotCount)}${tail}`
}
