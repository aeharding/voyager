import { Comment, Person, Post } from "lemmy-js-client";

import { ModeratorRole } from "../../useCanModerate";

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

export function getAdminRole(person: Person | undefined): ModeratorRole {
  return person && person.local ? "admin-local" : "admin-remote";
}
