import { LikeType, providerSupports, ThreadiverseMode } from "threadiverse";

export type ProfileVotedMode = ThreadiverseMode | null | undefined;

/**
 * `undefined` means provider discovery is still in progress. `false` means the
 * active provider is known and cannot honor this particular voted-feed query.
 */
export function supportsProfileVotedFeed(
  mode: ProfileVotedMode,
  likeType: LikeType,
): boolean | undefined {
  if (mode === undefined) return;
  if (mode === null) return false;

  return providerSupports(mode, "listPersonLiked", {
    like_type: likeType,
  });
}
