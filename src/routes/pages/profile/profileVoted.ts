import {
  LikeType,
  PageCursor,
  RequestOptions,
  ThreadiverseClient,
} from "threadiverse";

import { LIMIT } from "#/services/lemmy";

export type ProfileVotedClient = Pick<
  ThreadiverseClient,
  "listPersonLiked" | "supports"
>;

/** Resolve support before calling the voted-feed endpoint for a deep link. */
export async function fetchProfileVotedPage(
  client: ProfileVotedClient,
  likeType: LikeType,
  page_cursor: PageCursor | undefined,
  options?: RequestOptions,
) {
  const supported = await client.supports("listPersonLiked", {
    like_type: likeType,
  });
  if (!supported) return { data: [] };

  // `supports()` connects implicitly, so this also works when a deep link is
  // opened before Voyager's provider discovery has populated Redux.
  return client.listPersonLiked(
    {
      page_cursor,
      like_type: likeType,
      limit: LIMIT,
    },
    options,
  );
}
