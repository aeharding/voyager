import AnyClient from "./clients/AnyClient";

export interface ClientMetadata {
  url: string;
  jwt?: string;
}

export function getClient(url: string, jwt?: string) {
  return new AnyClient(`https://${url}`, undefined, jwt);
}
