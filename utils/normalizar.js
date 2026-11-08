export function normalizarPais(pais) {
  if (!pais) return null;
  return String(pais).trim().toUpperCase();
}