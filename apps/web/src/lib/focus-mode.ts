const KEY = "fylmico.focusMode";

export function getFocusMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.localStorage.getItem(KEY) === "1";
}

export function setFocusMode(value: boolean): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(KEY, value ? "1" : "0");
  window.dispatchEvent(new Event("fylmico:focus-mode-change"));
}
