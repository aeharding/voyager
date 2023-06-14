import { LemmyHttp } from "lemmy-js-client";

export function getClient(pathname: string): LemmyHttp {
  let baseUrl = `/api/${pathname.split("/")[1]}`;
  return new LemmyHttp(baseUrl);
}

export const LIMIT = 30;
