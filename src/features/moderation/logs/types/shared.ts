import { Comment, Modlog, Person, Post } from "threadiverse";

import { ModeratorRole } from "../../useCanModerate";

export function buildBaseData(modlog: Modlog) {
  return {
    when: modlog.published_at,
    reason: modlog.reason,
    expires: modlog.expires_at,
  };
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
