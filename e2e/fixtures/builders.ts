// Voyager's fixture data, expressed as threadiverse/testing seed inputs.
// MockApi seeds these into its store; the fake derives every wire response,
// so this file owns test *data* only. Wire-level builders remain available
// as `build` for the few things without seed support (modlog) and for
// custom write-response payloads.

import { createLemmyV1Builders, DEFAULT_NOW } from "threadiverse/testing";

export const V1_HOST = "v1.test.lemmy";

export const NOW = DEFAULT_NOW;

// Fixed ids so specs can reference entities directly
export const me = { displayName: "alex", id: 100, name: "alex" };
export const mod = { displayName: "TheMod", id: 101, name: "themod" };
export const bannedPerson = { id: 102, name: "badperson" };

export const fixturePosts = [
  { body: "v1 body 1", id: 1, name: "First v1 post" },
  { body: "v1 body 2", id: 2, name: "Second v1 post" },
  { body: "v1 body 3", id: 3, name: "Third v1 post" },
];

/** Wire-format builders bound to the fake host (escape hatch) */
export const build = createLemmyV1Builders({ host: V1_HOST });

// --- Modlog: no seed support yet; wire fixtures exercise the flat
// ModlogView shape ---

const wireMod = build.person({
  display_name: mod.displayName,
  id: mod.id,
  name: mod.name,
});
const wireBanned = build.person({
  id: bannedPerson.id,
  name: bannedPerson.name,
});

export const fixtureModlog = [
  build.modlogView({
    id: 1,
    kind: "mod_feature_post_community",
    moderator: wireMod,
    target_post: build.post({
      body: fixturePosts[0]!.body,
      creator: build.person({ id: me.id, name: me.name }),
      id: fixturePosts[0]!.id,
      name: fixturePosts[0]!.name,
    }),
    target_community: build.community(),
  }),
  build.modlogView({
    id: 2,
    kind: "admin_ban",
    moderator: wireMod,
    reason: "Spam",
    target_person: wireBanned,
  }),
  build.modlogView({
    id: 3,
    kind: "mod_remove_comment",
    moderator: wireMod,
    reason: "Bad comment",
    target_community: build.community(),
    target_person: wireBanned,
  }),
];
