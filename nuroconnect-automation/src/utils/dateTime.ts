export function timestampForFile(date = new Date()): string {
  return date.toISOString().replace(/[:.]/g, '-');
}

export function isoNow(): string {
  return new Date().toISOString();
}
