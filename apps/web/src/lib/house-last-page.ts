const PREFIX = "fylmico.lastPage.";

export function getLastPage(houseId: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(PREFIX + houseId);
}

export function setLastPage(houseId: string, pathname: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(PREFIX + houseId, pathname);
}
