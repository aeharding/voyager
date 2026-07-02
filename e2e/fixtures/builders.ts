// Voyager's v1 fixture data, built on threadiverse/testing's typed wire
// builders. The wire-format knowledge (and its compile-time checking against
// lemmy-js-client-v1) lives in threadiverse; this file only owns the test
// data Voyager's specs assert against.

import { createLemmyV1Builders, DEFAULT_NOW } from "threadiverse/testing";

export const V1_HOST = "v1.test.lemmy";

export const NOW = DEFAULT_NOW;

const build = createLemmyV1Builders({ host: V1_HOST });

export const {
  community,
  pagedResponse,
  person,
  postView,
  privateMessageNotification,
  privateMessageView,
} = build;

export const me = person({ id: 100, name: "alex", display_name: "alex" });
const mod = person({ id: 101, name: "themod", display_name: "TheMod" });
const bannedPerson = person({ id: 102, name: "badperson" });

export const fixturePosts = [
  postView({ id: 1, name: "First v1 post", body: "v1 body 1", creator: me }),
  postView({ id: 2, name: "Second v1 post", body: "v1 body 2", creator: me }),
  postView({ id: 3, name: "Third v1 post", body: "v1 body 3", creator: me }),
];

/** Like threadiverse/testing's commentView, with Voyager's default post */
export function commentView(
  over: Omit<Parameters<typeof build.commentView>[0], "post"> &
    Partial<Pick<Parameters<typeof build.commentView>[0], "post">>,
) {
  return build.commentView({ post: fixturePosts[0]!, ...over });
}

/** Like threadiverse/testing's commentNotification, notifying `me` */
export function commentNotification(
  over: Omit<Parameters<typeof build.commentNotification>[0], "recipient_id">,
) {
  return build.commentNotification({ recipient_id: me.id, ...over });
}

export const personResponse = build.personResponse;
export const communityResponse = build.communityResponse;

/** Raw v1 MyUserInfo returned by GET /account (getMyUser) */
export function myUserInfo(subject: ReturnType<typeof person>) {
  return build.myUserInfo({ person: subject });
}

// `userPersonSelector` resolves to `me` for logged-in tests
export const myUser = myUserInfo(me);

export const siteResponse = build.getSiteResponse({
  posts: fixturePosts.length,
});

export const fixtureModlog = [
  build.modlogView({
    id: 1,
    kind: "mod_feature_post_community",
    moderator: mod,
    target_post: fixturePosts[0]!.post,
    target_community: community(),
  }),
  build.modlogView({
    id: 2,
    kind: "admin_ban",
    moderator: mod,
    reason: "Spam",
    target_person: bannedPerson,
  }),
  build.modlogView({
    id: 3,
    kind: "mod_remove_comment",
    moderator: mod,
    reason: "Bad comment",
    target_community: community(),
    target_person: bannedPerson,
  }),
];
