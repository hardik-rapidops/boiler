export function ensureDefined<T>(value: T | null | undefined, message: string): T {
  if (value === null || value === undefined || value === '') {
    throw new Error(message);
  }
  return value;
}

export function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
