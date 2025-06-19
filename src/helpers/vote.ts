import { CommentView, PostView } from "threadiverse";

import { useAppSelector } from "#/store";

import { getCounts } from "./lemmyCompat";

export function useCalculateTotalScore(item: PostView | CommentView) {
  const isComment = "comment" in item;
  const id = isComment ? item.comment.id : item.post.id;
  const storeVote = useAppSelector((state) =>
    isComment
      ? state.comment.commentVotesById[id]
      : state.post.postVotesById[id],
  );

  return getCounts(item).score - (item.my_vote ?? 0) + (storeVote ?? 0);
}

export function useCalculateSeparateScore(item: PostView | CommentView) {
  const isComment = "comment" in item;
  const id = isComment ? item.comment.id : item.post.id;
  const storeVote = useAppSelector((state) =>
    isComment
      ? state.comment.commentVotesById[id]
      : state.post.postVotesById[id],
  );

  const counts = getCounts(item);

  const upvotes =
    counts.upvotes - (item.my_vote === 1 ? 1 : 0) + (storeVote === 1 ? 1 : 0);
  const downvotes =
    counts.downvotes -
    (item.my_vote === -1 ? 1 : 0) +
    (storeVote === -1 ? 1 : 0);

  return { upvotes, downvotes };
}
