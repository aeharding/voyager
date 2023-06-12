export function isInstalled(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches;
}
