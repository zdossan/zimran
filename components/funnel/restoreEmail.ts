// Client-side shape check for the restore email (the server re-checks with the same rule).
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmailShape(v: string): string | null {
  const email = v.trim().toLowerCase();
  return email.length <= 254 && EMAIL.test(email) ? email : null;
}
