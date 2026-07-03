// PieFed e2e fixture: the provider-matrix counterpart to the lemmyv1 MockApi,
// built on the same threadiverse/testing seed API. First e2e coverage of
// Voyager's PieFed paths.

import { test as base } from "@playwright/test";
import { FakePiefedInstance, SeedPerson, SeedPost } from "threadiverse/testing";

export const PIEFED_HOST = "piefed.test.example";

export class PiefedMockApi extends FakePiefedInstance {
  readonly me: SeedPerson;

  readonly posts: SeedPost[];

  constructor() {
    super({ host: PIEFED_HOST });

    this.me = this.seed.person({ displayName: "alex", id: 100, name: "alex" });
    const community = this.seed.community({});
    this.posts = [
      this.seed.post({
        body: "piefed body 1",
        community,
        creator: this.me,
        id: 1,
        name: "First piefed post",
      }),
      this.seed.post({
        body: "piefed body 2",
        community,
        creator: this.me,
        id: 2,
        name: "Second piefed post",
      }),
    ];
    this.seed.site({ name: "Test piefed site" });
  }
}

interface Fixtures {
  api: PiefedMockApi;
}

export const test = base.extend<Fixtures>({
  api: [
    async ({ page }, use) => {
      // Same anti-flake switch the lemmyv1 fixture uses
      await page.addInitScript(() => {
        Object.assign(window, { __E2E_DISABLE_ANIMATIONS: true });
      });

      const api = new PiefedMockApi();
      await api.install(page);

      await use(api);
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
