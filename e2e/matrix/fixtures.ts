// Provider-matrix fixture: the SAME Voyager fixture content (seedDefaults)
// served by either fake instance, selected via the `provider` test option
// (see the matrix-lemmyv1 / matrix-piefed projects in playwright.config.ts).
// Specs in e2e/matrix must pass on both providers with identical text —
// build URLs from `api.host`, seed via `api.seed.*`, and assert requests
// via canonical `api.callsTo()` / `api.waitForPayload()` payloads.

import { test as base } from "@playwright/test";
import type { BaseClient } from "threadiverse";
import {
  FakeInstance,
  FakePiefedInstance,
  LemmyV1Operation,
  OperationResponder,
  PiefedOperation,
  SeedPerson,
  SeedPost,
  SeedStore,
} from "threadiverse/testing";

import { loginAs } from "../fixtures/auth";
import { MockApi, seedDefaults } from "../fixtures/mocks";

export const PIEFED_HOST = "piefed.test.example";

export type Provider = "lemmyv1" | "piefed";

export class PiefedMockApi extends FakePiefedInstance {
  /** The default logged-in-capable user, seeded into the store */
  readonly me: SeedPerson;

  /** The seeded default feed posts (ids 1..3 in test_comm) */
  readonly posts: SeedPost[];

  constructor() {
    super({ host: PIEFED_HOST });

    ({ me: this.me, posts: this.posts } = seedDefaults(this.seed));

    // threadiverse gap: the piefed fake's derived `GET /api/alpha/site`
    // never includes `my_user`, so logged-in boot (which reads
    // `site.my_user` for the active account) needs this wire-level
    // override, derived from the seed's logged-in state.
    this.mock("GET /api/alpha/site", () => ({
      json: {
        ...this.build.getSiteResponse({ name: this.seed.siteName }),
        ...(this.seed.loggedInPerson && {
          my_user: {
            community_blocks: [],
            follows: [],
            instance_blocks: [],
            local_user_view: {
              counts: {
                comment_count: 0,
                person_id: this.seed.loggedInPerson.id,
                post_count: 0,
              },
              local_user: { show_nsfw: false },
              person: this.build.person({
                id: this.seed.loggedInPerson.id,
                title: this.seed.loggedInPerson.displayName,
                user_name: this.seed.loggedInPerson.name,
              }),
            },
            moderates: [],
            person_blocks: [],
          },
        }),
      },
    }));
  }
}

/** Operations both providers' fakes define */
type SharedOperation = Extract<LemmyV1Operation, PiefedOperation>;

/** Shared operations with a canonical request decoder on both fakes */
type SharedDecodableOperation = Exclude<
  SharedOperation,
  "getSite" | "getUnreadCount"
>;

type Payload<Operation extends keyof BaseClient> = Partial<
  Parameters<BaseClient[Operation]>[0]
>;

/**
 * The provider-agnostic surface of both fakes: seeding, canonical
 * operation overrides/assertions for the operations both providers
 * define, and the wire-level escape hatches. (A plain class union isn't
 * usable — the generic operation methods' type parameters diverge, so the
 * union isn't callable.) Anything provider-specific belongs in
 * e2e/lemmyv1.
 */
export interface MatrixApi extends Pick<
  FakeInstance,
  "calls" | "host" | "mock" | "mockOnce" | "waitForCall"
> {
  /** Canonical payloads of the requests an operation received */
  callsTo<Operation extends SharedDecodableOperation>(
    operation: Operation,
  ): Payload<Operation>[];

  /** The default logged-in-capable user, seeded into the store */
  me: SeedPerson;

  /** Override an operation's response (canonical `{ error }` supported) */
  on: Record<SharedOperation, (responder: OperationResponder) => void>;

  /** Override an operation's next response only, then fall back */
  once: Record<SharedOperation, (responder: OperationResponder) => void>;

  /** The seeded default feed posts (ids 1..3 in test_comm) */
  posts: SeedPost[];

  /** Semantic content store the default routes are derived from */
  seed: SeedStore;

  /** Wait for an operation's next request; resolves its canonical payload */
  waitForPayload<Operation extends SharedDecodableOperation>(
    operation: Operation,
    predicate?: (payload: Payload<Operation>) => boolean,
    options?: { timeoutMs?: number },
  ): Promise<Payload<Operation>>;
}

interface Fixtures {
  /**
   * The selected provider's fake instance, pre-seeded with Voyager's
   * fixture content. Same semantic surface on either provider.
   */
  api: MatrixApi;

  /** Set `test.use({ loggedIn: true })` to boot logged into the fake host. */
  loggedIn: boolean;

  /** Selected by the matrix-* projects in playwright.config.ts. */
  provider: Provider;
}

export const test = base.extend<Fixtures>({
  loggedIn: [false, { option: true }],
  provider: ["lemmyv1", { option: true }],

  api: [
    async ({ loggedIn, page, provider }, use) => {
      // Picked up by setupIonicReact (src/core/App.tsx) to make transitions
      // instant — Ionic's JS-driven animations are a major flake source.
      await page.addInitScript(() => {
        Object.assign(window, { __E2E_DISABLE_ANIMATIONS: true });
      });

      const api = provider === "lemmyv1" ? new MockApi() : new PiefedMockApi();
      await api.install(page);

      if (loggedIn) await loginAs(page, api);

      await use(api);
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
