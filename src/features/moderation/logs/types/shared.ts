import { Comment, Post } from "lemmy-js-client";

interface ModItem {
  when_: string;
  reason?: string;
  expires?: string;
}

export function buildBaseData({ when_, reason, expires }: ModItem) {
  return { when: when_, reason, expires };
}

export function buildPostMessage(post: Post): string {
  return `‘${post.name}’`;
}

export function buildCommentMessage(comment: Comment): string {
  return `‘${comment.content}’`;
}
