import { uniq } from "es-toolkit";

import categories from "./categories.json";

/**
 * 🚨 Want to add a server to this list?
 * Please read the [curated servers policy](./README.md) first.
 */
export const SERVERS_BY_CATEGORY = categories;

export const WHITELISTED_SERVERS = uniq(
  Object.values(SERVERS_BY_CATEGORY).flat(),
);

const PIEFED_INSTANCES = [
  "piefed.social",
  "preferred.social",
  "feddit.online",
  "piefed.blahaj.zone",
  "piefed.world",
  "piefed.zip",
  "piefed.ca",
  "feddit.fr",
];

const ADDITIONAL_LOGIN_INSTANCES = [
  ...PIEFED_INSTANCES,
  "lemmy.ml",
  "lemmygrad.ml",
  "fedinsfw.app",
  "hexbear.net",
  "vger.social",
];

export const LOGIN_SERVERS = uniq([
  ...WHITELISTED_SERVERS,
  ...ADDITIONAL_LOGIN_INSTANCES,
]);

export type ServerCategory = keyof typeof SERVERS_BY_CATEGORY | "recommended";
