import { LemmyHttp } from "lemmy-js-client";

export function getClient(url: string): LemmyHttp {
  const baseUrl = `${location.origin}/api/${url}`;
  return new LemmyHttp(baseUrl);
}

export const LIMIT = 30;
