import { PostView } from "lemmy-js-client";

import { getItemActorName } from "#/helpers/lemmy";
import { OPostBlurNsfw, PostBlurNsfwType } from "#/services/db";

import styles from "./Nsfw.module.css";

export default function Nsfw() {
  return <span className={styles.container}>NSFW</span>;
}

const NSFW_INSTANCES = ["lemmynsfw.com"];

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
