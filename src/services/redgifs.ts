import { CapacitorHttp } from "@capacitor/core";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";

import { isTauri } from "#/helpers/device";

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

async function getJson(url: string, headers: Record<string, string>) {
  if (isTauri()) {
    const response = await tauriFetch(url, { headers });
    return response.json();
  }

  const result = await CapacitorHttp.get({ url, headers });
  return result.data;
}

export async function getTemporaryToken(): Promise<string> {
  const response: TemporaryTokenResponse = await getJson(
    `${BASE_URL}/v2/auth/temporary`,
    HEADERS,
  );

  if (typeof response?.token !== "string")
    throw new Error("Failed to get temporary redgifs token");

  return response.token;
}

export async function getGif(id: string, token: string): Promise<string> {
  const data = await getJson(`${BASE_URL}/v2/gifs/${id.toLowerCase()}`, {
    ...HEADERS,
    Authorization: `Bearer ${token}`,
  });

  return data.gif.urls.hd;
}
