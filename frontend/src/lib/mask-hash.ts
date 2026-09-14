/**
 * Enmascara una huella SHA-256 para roles sin permiso de ver el hash completo (RF-27, RNF-08).
 * Deja visibles los primeros y últimos 8 caracteres, el resto se reemplaza por puntos.
 */
export function maskHash(hash: string): string {
  if (hash.length <= 20) return hash
  const head = hash.slice(0, 8)
  const tail = hash.slice(-8)
  const dotCount = Math.min(hash.length - 16, 20)
  return `${head}${"•".repeat(dotCount)}${tail}`
}
