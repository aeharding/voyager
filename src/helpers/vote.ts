import { CommentView, PostView } from "threadiverse";

import { useAppSelector } from "#/store";

/**
 * Convert voyager's tri-state numeric vote into v1's `is_upvote?` flag.
 *   1  → true   (upvote)
 *  -1  → false  (downvote)
 *   0  → undefined (clear vote)
 */
export function voteToIsUpvote(vote: 1 | -1 | 0): boolean | undefined {
  if (vote === 1) return true;
  if (vote === -1) return false;
  return undefined;
}

export function useCalculateTotalScore(item: PostView | CommentView) {
  const isComment = "comment" in item;
  const id = isComment ? item.comment.id : item.post.id;
  const storeVote = useAppSelector((state) =>
    isComment
      ? state.comment.commentVotesById[id]
      : state.post.postVotesById[id],
  );
  const entity = isComment ? item.comment : item.post;

  return (
    entity.upvotes - entity.downvotes - (item.my_vote ?? 0) + (storeVote ?? 0)
  );
}

export function useCalculateSeparateScore(item: PostView | CommentView) {
  const isComment = "comment" in item;
  const id = isComment ? item.comment.id : item.post.id;
  const storeVote = useAppSelector((state) =>
    isComment
      ? state.comment.commentVotesById[id]
      : state.post.postVotesById[id],
  );
  const entity = isComment ? item.comment : item.post;

  const upvotes =
    entity.upvotes - (item.my_vote === 1 ? 1 : 0) + (storeVote === 1 ? 1 : 0);
  const downvotes =
    entity.downvotes -
    (item.my_vote === -1 ? 1 : 0) +
    (storeVote === -1 ? 1 : 0);

  return { upvotes, downvotes };
}
