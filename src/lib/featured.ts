export function isFeatured(item: { featuredUntil: string | null }): boolean {
  if (!item.featuredUntil) return false;
  const until = new Date(item.featuredUntil).getTime();
  return Number.isFinite(until) && until > Date.now();
}
