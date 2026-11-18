export function matchesTextSearch(query: string, ...values: string[]): boolean {
  const trimmed = query.trim();
  if (!trimmed) return true;

  const normalizedQuery = trimmed.toLowerCase();
  return values.some((value) => value.toLowerCase().includes(normalizedQuery));
}
