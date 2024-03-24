export function parseJWT<T>(payload: string): T {
  const base64 = payload.split(".")[1]!;
  const jsonPayload = atob(base64);
  return JSON.parse(jsonPayload);
}
