import { describe, expect, it } from "vitest";

import {
  buildGoVoyagerLink,
  extractLemmyLinkFromPotentialFediRedirectService,
  FEDI_REDIRECT_SERVICE_COMPATIBLE_HOSTS,
} from "./fediRedirect";

describe("buildGoVoyagerLink", () => {
  it("builds a valid goVoyager link from a Lemmy URL", () => {
    const input = "https://lemmy.world/post/123";
    const expected = `https://go.getvoyager.app/lemmy.world/post/123`;
    expect(buildGoVoyagerLink(input)).toBe(expected);
  });

  it("returns undefined for invalid URLs", () => {
    expect(buildGoVoyagerLink("not-a-url")).toBeUndefined();
    expect(buildGoVoyagerLink("")).toBeUndefined();
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
