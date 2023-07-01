import { Dictionary } from "@reduxjs/toolkit";
import { get, set } from "../../settings/storage";

const HIDDEN_POSTS_KEY_PREFIX = "hidden-posts-";
const MAX_HIDDEN_POSTS = 50_000;

function getHiddenPostsKey(handle: string) {
  return `${HIDDEN_POSTS_KEY_PREFIX}${handle}`;
}

export function updateStoredHiddenPosts(handle: string, posts: number[]) {
  posts = posts.slice(0, MAX_HIDDEN_POSTS);

  set(getHiddenPostsKey(handle), posts);
}

export function getStoredHiddenPosts(handle: string): number[] {
  return get(getHiddenPostsKey(handle)) || [];
}

export function buildHiddenPostsByIdFromArray(
  data: number[]
): Dictionary<true> {
  const obj: Dictionary<true> = {};

  for (let i = 0; i < data.length; i++) {
    obj[data[i]] = true;
  }

  return obj;
}
