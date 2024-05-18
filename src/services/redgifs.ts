import { CapacitorHttp } from "@capacitor/core";

// https://github.com/Redgifs/api/wiki/Temporary-tokens

interface TemporaryTokenResponse {
  token?: string;
  addr: string;
  agent: string;
  rtfm: string;
}

const BASE_URL = "https://api.redgifs.com";
const HEADERS = {
  ["User-Agent"]: navigator.userAgent,
} as const;

export async function getTemporaryToken(): Promise<string> {
  const result = await CapacitorHttp.get({
    url: `${BASE_URL}/v2/auth/temporary`,
    headers: HEADERS,
  });

  const response: TemporaryTokenResponse = result.data;

  if (typeof response?.token !== "string")
    throw new Error("Failed to get temporary redgifs token");

  return response.token;
}

export async function getGif(id: string, token: string): Promise<string> {
  const result = await CapacitorHttp.get({
    url: `${BASE_URL}/v2/gifs/${id.toLowerCase()}`,
    headers: {
      ...HEADERS,
      Authorization: `Bearer ${token}`,
    },
  });

  return result.data.gif.urls.hd;
}
