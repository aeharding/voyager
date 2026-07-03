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
} from "threadiverse/testing";

import { build, fixtureModlog, fixturePosts, me, V1_HOST } from "./builders";

export type { Matcher, RecordedCall, Responder } from "threadiverse/testing";

export class MockApi extends FakeLemmyV1Instance {
  /** The default logged-in-capable user, seeded into the store */
  readonly me: SeedPerson;

  /** The seeded default feed posts (ids 1..3 in test_comm) */
  readonly posts: SeedPost[];

  constructor() {
    super({ host: V1_HOST });

    this.me = this.seed.person(me);
    // First seeded community defaults to id 111, matching build.community()
    const community = this.seed.community();
    this.posts = fixturePosts.map((post) =>
      this.seed.post({ ...post, community, creator: this.me }),
    );
    this.seed.site({ name: "Test v1 site" });

    // No seed support for modlog yet — wire-level fixture
    this.mock("GET /api/v4/modlog", {
      json: build.pagedResponse(fixtureModlog),
    });
  }
}
