// Voyager's fake Lemmy v1 instance: threadiverse/testing's
// FakeLemmyV1Instance seeded with Voyager's fixture data. Specs describe
// content via `api.seed.*`, override behavior via `api.on.*`/`api.once.*`
// (canonical `{ error }` supported), and assert on outgoing requests'
// canonical payloads via `api.callsTo()` / `api.waitForPayload()`.
// Route-level `api.mock()`/`api.calls()` remain the escape hatch (e.g. for
// non-canonical wire params like sort and page_cursor).

import {
  FakeLemmyV1Instance,
  SeedPerson,
  SeedPost,
  SeedStore,
} from "threadiverse/testing";

import { build, fixtureModlog, fixturePosts, me, V1_HOST } from "./builders";

export type { Matcher, RecordedCall, Responder } from "threadiverse/testing";

/**
 * Voyager's provider-agnostic fixture content: the default user, the
 * default community, the ids 1..3 feed posts, and the site name. Seeded
 * into every fake instance (lemmyv1 and piefed) so shared specs assert on
 * identical content regardless of provider.
 */
export function seedDefaults(seed: SeedStore) {
  const seededMe = seed.person(me);
  // First seeded community defaults to id 111, matching build.community()
  const community = seed.community();
  const posts = fixturePosts.map((post) =>
    seed.post({ ...post, community, creator: seededMe }),
  );
  seed.site({ name: "Test site" });

  return { me: seededMe, posts };
}

export class MockApi extends FakeLemmyV1Instance {
  /** The default logged-in-capable user, seeded into the store */
  readonly me: SeedPerson;

  /** The seeded default feed posts (ids 1..3 in test_comm) */
  readonly posts: SeedPost[];

  constructor() {
    super({ host: V1_HOST });

    ({ me: this.me, posts: this.posts } = seedDefaults(this.seed));

    // No seed support for modlog yet — wire-level fixture (lemmyv1-only)
    this.mock("GET /api/v4/modlog", {
      json: build.pagedResponse(fixtureModlog),
    });
  }

  /** A valid provider wire community response, for follow/community writes */
  get communityResponse(): unknown {
    return this.build.communityResponse();
  }
}
