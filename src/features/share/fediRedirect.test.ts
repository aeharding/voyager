import { describe, expect, it } from "vitest";

import {
  buildFediRedirectLink,
  extractLemmyLinkFromPotentialFediRedirectService,
  FEDI_REDIRECT_SERVICE_COMPATIBLE_HOSTS,
  GO_VOYAGER_HOST,
} from "./fediRedirect";

describe("buildGoVoyagerLink", () => {
  it("builds a valid goVoyager link from a Lemmy URL", () => {
    const input = "https://lemmy.world/post/123";
    const expected = `https://go.getvoyager.app/lemmy.world/post/123`;
    expect(buildFediRedirectLink(GO_VOYAGER_HOST, input)).toBe(expected);
  });

  it("returns undefined for invalid URLs", () => {
    expect(buildFediRedirectLink(GO_VOYAGER_HOST, "not-a-url")).toBeUndefined();
    expect(buildFediRedirectLink(GO_VOYAGER_HOST, "")).toBeUndefined();
  });
});

describe("extractLemmyLinkFromPotentialFediRedirectService", () => {
  it.each(FEDI_REDIRECT_SERVICE_COMPATIBLE_HOSTS)(
    "extracts Lemmy link from %s URL",
    (host) => {
      const input = `https://${host}/lemmy.world/post/123`;
      const expected = "https://lemmy.world/post/123";
      expect(extractLemmyLinkFromPotentialFediRedirectService(input)).toBe(
        expected,
      );
    },
  );

  it("returns undefined for non-compatible hosts", () => {
    const input = "https://example.com/lemmy.world/post/123";
    expect(
      extractLemmyLinkFromPotentialFediRedirectService(input),
    ).toBeUndefined();
  });

  it("returns undefined for invalid URLs", () => {
    expect(
      extractLemmyLinkFromPotentialFediRedirectService("not-a-url"),
    ).toBeUndefined();
    expect(
      extractLemmyLinkFromPotentialFediRedirectService(""),
    ).toBeUndefined();
  });

  it("returns undefined when pathname doesn't contain a dot", () => {
    const input = `https://go.getvoyager.app/not-a-lemmy-instance`;
    expect(
      extractLemmyLinkFromPotentialFediRedirectService(input),
    ).toBeUndefined();
  });
});
