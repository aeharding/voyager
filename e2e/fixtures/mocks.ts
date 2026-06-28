// Route-mocking layer for the fake Lemmy v1 instance. All /api/v4 traffic
// funnels through a single dispatcher, so spec overrides deterministically
// shadow defaults and every request is recorded for payload assertions.

import { expect, type Page, type Route } from "@playwright/test";

import {
  fixtureModlog,
  fixturePosts,
  pagedResponse,
  siteResponse,
  V1_HOST,
} from "./builders";

// nodeinfo discovery: tells threadiverse this is a Lemmy v1 instance
const wellknownNodeinfo = {
  links: [
    {
      rel: "http://nodeinfo.diaspora.software/ns/schema/2.1",
      href: `https://${V1_HOST}/nodeinfo/2.1`,
    },
  ],
};

const nodeinfo21 = {
  version: "2.1",
  software: { name: "lemmy", version: "1.0.0-beta.1" },
};

export interface RecordedCall {
  method: string;
  pathname: string;
  query: URLSearchParams;
  body: unknown;
  headers: Record<string, string>;
}

type MockResponse = { status?: number; json: unknown } | { abort: string };

type Responder =
  MockResponse | ((call: RecordedCall) => MockResponse | Promise<MockResponse>);

/** `"METHOD /api/v4/path"` — matched against pathname only (query ignored) */
type Matcher = `${"GET" | "POST" | "PUT" | "DELETE"} /api/v4/${string}`;

export class MockApi {
  #page: Page;
  #handlers = new Map<Matcher, Responder>();
  #calls: RecordedCall[] = [];

  constructor(page: Page) {
    this.#page = page;

    // Everything the v1 path touches at app startup
    this.mock("GET /api/v4/site", { json: siteResponse });
    this.mock("GET /api/v4/post/list", { json: pagedResponse(fixturePosts) });
    this.mock("GET /api/v4/comment/list", { json: pagedResponse([]) });
    this.mock("GET /api/v4/modlog", { json: pagedResponse(fixtureModlog) });
    // Paginated; throws UnsupportedError in adapter; voyager catches
    this.mock("GET /api/v4/federated_instances", {
      status: 400,
      json: { error: "paginated" },
    });
  }

  async install() {
    await this.#page.route(`https://${V1_HOST}/.well-known/nodeinfo`, (route) =>
      route.fulfill({ json: wellknownNodeinfo }),
    );
    await this.#page.route(`https://${V1_HOST}/nodeinfo/2.1`, (route) =>
      route.fulfill({ json: nodeinfo21 }),
    );

    await this.#page.route("**/api/v4/**", (route) => this.#dispatch(route));
  }

  /** Set (or replace) the response for an endpoint. Last call wins. */
  mock(matcher: Matcher, responder: Responder) {
    this.#handlers.set(matcher, responder);
  }

  /** All recorded requests for `"METHOD /api/v4/path"` (query ignored). */
  calls(matcher: Matcher): RecordedCall[] {
    return this.#calls.filter(
      (call) => `${call.method} ${call.pathname}` === matcher,
    );
  }

  /** Wait until a matching request is recorded, then return the latest. */
  async waitForCall(
    matcher: Matcher,
    predicate: (call: RecordedCall) => boolean = () => true,
  ): Promise<RecordedCall> {
    await expect
      .poll(() => this.calls(matcher).filter(predicate).length, {
        message: `waiting for ${matcher}`,
      })
      .toBeGreaterThan(0);

    return this.calls(matcher).filter(predicate).at(-1)!;
  }

  async #dispatch(route: Route) {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();

    const call: RecordedCall = {
      method,
      pathname: url.pathname,
      query: url.searchParams,
      body: parseBody(request.postData()),
      headers: request.headers(),
    };
    this.#calls.push(call);

    const responder = this.#handlers.get(
      `${method} ${url.pathname}` as Matcher,
    );

    if (!responder) {
      // Surface missing mocks loudly instead of letting requests escape to
      // the real network (the app treats this like any server error).
      console.warn(
        `[e2e] unmocked request: ${method} ${url.pathname}${url.search}`,
      );
      await route.fulfill({ status: 404, json: { error: "not_found" } });
      return;
    }

    const response =
      typeof responder === "function" ? await responder(call) : responder;

    if ("abort" in response) {
      await route.abort(response.abort);
      return;
    }

    await route.fulfill({
      status: response.status ?? 200,
      json: response.json,
    });
  }
}

function parseBody(postData: string | null): unknown {
  if (!postData) return undefined;

  try {
    return JSON.parse(postData);
  } catch {
    return postData;
  }
}
