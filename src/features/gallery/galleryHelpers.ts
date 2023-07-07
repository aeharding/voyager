export function getBaseUrl(): string {
  return `${window.location.pathname}${window.location.search}`;
}

export function getHashValue(): string {
  return window.location.hash.substring(1);
}
