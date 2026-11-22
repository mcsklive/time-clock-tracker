const pendingSignInEmailKey = "coachlog.pendingSignInEmail";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function setPendingSignInEmail(email: string): void {
  window.sessionStorage.setItem(pendingSignInEmailKey, normalizeEmail(email));
}

export function getPendingSignInEmail(): string | null {
  if (typeof window === "undefined") return null;
  const email = window.sessionStorage.getItem(pendingSignInEmailKey);
  return email ? normalizeEmail(email) : null;
}

export function clearPendingSignInEmail(): void {
  window.sessionStorage.removeItem(pendingSignInEmailKey);
}
