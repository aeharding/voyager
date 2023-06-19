import { LemmyHttp } from "lemmy-js-client";

export function getClient(url: string): LemmyHttp {
  let baseUrl = `/api/${url}`;
  return new LemmyHttp(baseUrl);
}

export const LIMIT = 30;
