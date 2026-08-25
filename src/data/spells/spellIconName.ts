export function normalizeSpellIconName(icon: string): string {
  return icon.replace(/\.jpg$/i, '').trim().replace(/\s+/g, '-')
}
