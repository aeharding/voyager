// Voyager's fake Lemmy v1 instance: threadiverse/testing's FakeLemmyV1Instance
// (nodeinfo discovery, route table, request recording, Playwright adapter)
// seeded with Voyager's fixture data. Spec overrides via `api.mock()`
// deterministically shadow defaults; assert on requests via `api.calls()` /
// `api.waitForCall()`.

import { FakeLemmyV1Instance } from "threadiverse/testing";

import { fixtureModlog, fixturePosts, V1_HOST } from "./builders";

export type { Matcher, RecordedCall, Responder } from "threadiverse/testing";

export class MockApi extends FakeLemmyV1Instance {
  constructor() {
    super({
      host: V1_HOST,
      modlog: fixtureModlog,
      posts: fixturePosts,
    });
  }
}
