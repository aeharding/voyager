import { CommentView, PostView } from "lemmy-js-client";

import { useAppSelector } from "#/store";

export function useCalculateTotalScore(item: PostView | CommentView) {
  const isComment = "comment" in item;
  const id = isComment ? item.comment.id : item.post.id;
  const storeVote = useAppSelector((state) =>
    isComment
      ? state.comment.commentVotesById[id]
      : state.post.postVotesById[id],
  );

  return item.counts.score - (item.my_vote ?? 0) + (storeVote ?? 0);
}

export function useCalculateSeparateScore(item: PostView | CommentView) {
  const isComment = "comment" in item;
  const id = isComment ? item.comment.id : item.post.id;
  const storeVote = useAppSelector((state) =>
    isComment
      ? state.comment.commentVotesById[id]
      : state.post.postVotesById[id],
  );

  const upvotes =
    item.counts.upvotes -
    (item.my_vote === 1 ? 1 : 0) +
    (storeVote === 1 ? 1 : 0);
  const downvotes =
    item.counts.downvotes -
    (item.my_vote === -1 ? 1 : 0) +
    (storeVote === -1 ? 1 : 0);

  return { upvotes, downvotes };
}
