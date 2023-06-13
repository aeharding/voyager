import { LemmyHttp } from "lemmy-js-client";

let baseUrl = "/api/lemmy.ml";
export let client: LemmyHttp = new LemmyHttp(baseUrl);

export const LIMIT = 30;
