import { describe, expect, it, vi } from "vitest";

import { supportsProfileVotedFeed } from "#/features/user/profileCapabilities";
import { LIMIT } from "#/services/lemmy";

import { fetchProfileVotedPage, ProfileVotedClient } from "./profileVoted";

describe("profile voted-feed capabilities", () => {
  it("offers both voted feeds on Lemmy", () => {
    for (const mode of ["lemmyv0", "lemmyv1"] as const) {
      expect(supportsProfileVotedFeed(mode, "liked_only")).toBe(true);
      expect(supportsProfileVotedFeed(mode, "disliked_only")).toBe(true);
    }
  });

  it("offers only the supported upvoted feed on PieFed", () => {
    expect(supportsProfileVotedFeed("piefed", "liked_only")).toBe(true);
    expect(supportsProfileVotedFeed("piefed", "disliked_only")).toBe(false);
  });

  it("distinguishes pending discovery from a failed discovery", () => {
    expect(supportsProfileVotedFeed(undefined, "liked_only")).toBeUndefined();
    expect(supportsProfileVotedFeed(null, "liked_only")).toBe(false);
  });

  it("does not call listPersonLiked when the deep-link query is unsupported", async () => {
    const supports = vi.fn(async () => false);
    const listPersonLiked = vi.fn();
    const client = {
      supports,
      listPersonLiked,
    } as unknown as ProfileVotedClient;

    await expect(
      fetchProfileVotedPage(client, "disliked_only", undefined),
    ).resolves.toEqual({ data: [] });

    expect(supports).toHaveBeenCalledWith("listPersonLiked", {
      like_type: "disliked_only",
    });
    expect(listPersonLiked).not.toHaveBeenCalled();
  });

  it("forwards supported queries and request options exactly", async () => {
    const response = { data: [], next_page: "post:3" };
    const supports = vi.fn(async () => true);
    const listPersonLiked = vi.fn(async () => response);
    const client = {
      supports,
      listPersonLiked,
    } as unknown as ProfileVotedClient;
    const controller = new AbortController();

    await expect(
      fetchProfileVotedPage(client, "liked_only", "post:2", {
        signal: controller.signal,
      }),
    ).resolves.toBe(response);

    expect(listPersonLiked).toHaveBeenCalledWith(
      {
        page_cursor: "post:2",
        like_type: "liked_only",
        limit: LIMIT,
      },
      { signal: controller.signal },
    );
  });
});
