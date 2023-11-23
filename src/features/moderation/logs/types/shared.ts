import { Comment, Post } from "lemmy-js-client";

interface ModItem {
  when_: string;
  reason?: string;
}

export function buildBaseData({ when_, reason }: ModItem) {
  return { when: when_, reason };
}

export function buildPostMessage(post: Post): string {
  return `‘${post.name}’`;
}

export function buildCommentMessage(comment: Comment): string {
  return `‘${comment.content}’`;
}
