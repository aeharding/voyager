// Provider-matrix fixture: the SAME Voyager fixture content (seedDefaults)
// served by either fake instance, selected via the `provider` test option
// (see the matrix-lemmyv1 / matrix-piefed projects in playwright.config.ts).
// Specs in e2e/matrix must pass on both providers with identical text —
// build URLs from `api.host`, seed via `api.seed.*`, and assert requests
// via canonical `api.callsTo()` / `api.waitForPayload()` payloads.

import { test as base } from "@playwright/test";
import type {
  BaseClient,
  CommentSortTypeByMode,
  PostSortTypeByMode,
} from "threadiverse";
import {
  FakeInstance,
  FakePiefedInstance,
  LemmyV1Operation,
  OperationResponder,
  PiefedOperation,
  SeedComment,
  SeedPerson,
  SeedPost,
  SeedStore,
} from "threadiverse/testing";

import { MAX_DEFAULT_COMMENT_DEPTH } from "#/helpers/lemmy";

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
  }

  /** A valid provider wire community response, for follow/community writes */
  get communityResponse(): unknown {
    return this.build.communityResponse();
  }
}

/** Voyager sort options a shared spec can ask for, by their UI label */
type SortLabel = "New";

/**
 * Sort values are mode-specific *by design*: canonical `PostSortType` and
 * `CommentSortType` are keyed by provider mode, so the same "New" option is
 * `"new"` on lemmyv1 and `"New"` on piefed. Shared specs name the option and
 * let the fixture supply the selected provider's value (`api.sorts.New`).
 * Typed against threadiverse's per-mode sorts, so a renamed value breaks the
 * build instead of the suite.
 */
const SORTS = {
  lemmyv1: { New: "new" },
  piefed: { New: "New" },
} as const satisfies {
  [Mode in Provider]: Record<
    SortLabel,
    CommentSortTypeByMode[Mode]["sort"] & PostSortTypeByMode[Mode]["sort"]
  >;
};

/**
 * How deep (in seed path levels, top-level = 1) the post page's initial
 * comment load reaches. Threadiverse normalizes the providers' different
 * wire-level `max_depth` bases into this shared canonical depth.
 */
export const INITIAL_COMMENT_DEPTH = MAX_DEFAULT_COMMENT_DEPTH;

/** Operations both providers' fakes define */
type SharedOperation = Extract<LemmyV1Operation, PiefedOperation>;

/** Shared operations with a canonical request decoder on both fakes */
type SharedDecodableOperation = Exclude<
  SharedOperation,
  "getSite" | "getUnreadCount" | "markAllAsRead"
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
  "allCalls" | "calls" | "host" | "mock" | "mockOnce" | "waitForCall"
> {
  /** Canonical payloads of the requests an operation received */
  callsTo<Operation extends SharedDecodableOperation>(
    operation: Operation,
  ): Payload<Operation>[];

  /**
   * A valid provider wire community response. Follow/community write
   * responses aren't derived (nor canonical), but a spec can echo this so
   * the write parses on either provider without hardcoding wire shapes.
   */
  communityResponse: unknown;

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

  /** The selected provider's canonical value for each Voyager sort option */
  sorts: (typeof SORTS)[Provider];

  /** Wait for an operation's next request; resolves its canonical payload */
  waitForPayload<Operation extends SharedDecodableOperation>(
    operation: Operation,
    predicate?: (payload: Payload<Operation>) => boolean,
    options?: { timeoutMs?: number },
  ): Promise<Payload<Operation>>;
}

/**
 * Seed a chain of `depth` nested comments ("comment 1" replied to by
 * "comment 2", ...) on the fixture's first post, outermost first. The
 * returned seeds expose the generated ids for request assertions.
 */
export function seedCommentChain(api: MatrixApi, depth: number): SeedComment[] {
  const chain: SeedComment[] = [];

  for (let level = 1; level <= depth; level++) {
    const parent = chain.at(-1);
    const comment = api.seed.comment({ content: `comment ${level}` });

    if (parent) comment.path = `${parent.path}.${comment.id}`;

    chain.push(comment);
  }

  return chain;
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

      const fake = provider === "lemmyv1" ? new MockApi() : new PiefedMockApi();
      await fake.install(page);

      if (loggedIn) await loginAs(page, fake);

      await use(Object.assign(fake, { sorts: SORTS[provider] }));
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
