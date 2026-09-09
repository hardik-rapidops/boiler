const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function randomAlphaNumeric(length = 5): string {
  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}

export function uniqueSuffix(): string {
  return randomAlphaNumeric(5);
}

export function randomEmail(domain = 'yopmail.com'): string {
  return `${randomAlphaNumeric(5).toLowerCase()}@${domain}`;
}

export function randomZip(): string {
  return `${Math.floor(10000 + Math.random() * 89999)}`;
}
