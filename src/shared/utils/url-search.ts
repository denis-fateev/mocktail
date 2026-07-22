export function matchesUrlSearch(query: string, url: string): boolean {
  const trimmed = query.trim();
  if (!trimmed) return true;

  return url.toLowerCase().includes(trimmed.toLowerCase());
}
