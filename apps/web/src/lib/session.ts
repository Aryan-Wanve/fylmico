const SESSION_KEY = "fylmico:mock-session";

export function hasMockSession(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.sessionStorage.getItem(SESSION_KEY) === "1";
}

export function setMockSession(): void {
  window.sessionStorage.setItem(SESSION_KEY, "1");
}
