export const redgifUrlRegex = /^https:\/\/redgifs.com\/watch\/([a-z]+)/;

export function isRedgif(url: string): boolean {
  return redgifUrlRegex.test(url);
}
