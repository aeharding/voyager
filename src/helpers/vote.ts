import { Dictionary } from "@reduxjs/toolkit";
import { CommentView, PostView } from "lemmy-js-client";

export function calculateCurrentVotesCount(
  item: PostView | CommentView,
  votesById: Dictionary<0 | 1 | -1>
) {
  const id = "comment" in item ? item.comment.id : item.post.id;

  return item.counts.score - (item.my_vote ?? 0) + (votesById[id] ?? 0);
}
