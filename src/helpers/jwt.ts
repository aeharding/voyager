export function parseJWT<T>(payload: string): T {
  const base64 = payload.split(".")[1]!;
  const jsonPayload = atob(base64);
  return JSON.parse(jsonPayload);
}

export function isValidToken(token: string): boolean {
  return Date.now() / 1_000 < parseJWT<{ exp: number }>(token).exp;
}
