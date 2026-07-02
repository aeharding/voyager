// Voyager's fake Lemmy v1 instance: threadiverse/testing's FakeLemmyV1Instance
// (nodeinfo discovery, route table, request recording, Playwright adapter)
// seeded with Voyager's fixture data. Spec overrides via `api.mock()`
// deterministically shadow defaults; assert on requests via `api.calls()` /
// `api.waitForCall()`.

import { FakeLemmyV1Instance } from "threadiverse/testing";

import {
  fixtureModlog,
  fixturePosts,
  pagedResponse,
  siteResponse,
  V1_HOST,
} from "./builders";

export type { Matcher, RecordedCall, Responder } from "threadiverse/testing";

export class MockApi extends FakeLemmyV1Instance {
  constructor() {
    super({ host: V1_HOST });

    // Voyager's seeded defaults on top of the fake's empty ones
    this.mock("GET /api/v4/site", { json: siteResponse });
    this.mock("GET /api/v4/post/list", { json: pagedResponse(fixturePosts) });
    this.mock("GET /api/v4/modlog", { json: pagedResponse(fixtureModlog) });
  }
}
