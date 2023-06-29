// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function get(key: string): any {
  const data = localStorage.getItem(key);
  if (!data) return;
  return JSON.parse(data);
}

export function set(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}
