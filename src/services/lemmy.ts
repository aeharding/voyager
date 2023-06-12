import { LemmyHttp } from "lemmy-js-client";

let baseUrl = "/api/lemmy.world";
export let client: LemmyHttp = new LemmyHttp(baseUrl);

export const LIMIT = 30;
