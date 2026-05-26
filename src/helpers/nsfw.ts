import { PostView } from "threadiverse";

import { getItemActorName } from "#/helpers/lemmy";
import { OPostBlurNsfw, PostBlurNsfwType } from "#/services/db/types";

const NSFW_INSTANCES = ["fedinsfw.app"];

export function isNsfw(post: PostView): boolean {
  if (post.post.nsfw || post.community.nsfw) return true;

  if (NSFW_INSTANCES.includes(getItemActorName(post.community))) return true;

  return false;
}

export function isNsfwBlurred(
  post: PostView,
  blurNsfw: PostBlurNsfwType,
): boolean {
  if (blurNsfw === OPostBlurNsfw.Never) return false;

  return isNsfw(post);
}
