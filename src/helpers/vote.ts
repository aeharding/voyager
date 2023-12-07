import { CommentView, PostView } from "lemmy-js-client";

export function calculateTotalScore(
  item: PostView | CommentView,
  votesById: Record<string, 0 | 1 | -1 | undefined>,
) {
  const id = "comment" in item ? item.comment.id : item.post.id;
  return item.counts.score - (item.my_vote ?? 0) + (votesById[id] ?? 0);
}

export function calculateSeparateScore(
  item: PostView | CommentView,
  votesById: Record<string, 0 | 1 | -1 | undefined>,
) {
  const id = "comment" in item ? item.comment.id : item.post.id;

  const upvotes =
    item.counts.upvotes -
    (item.my_vote === 1 ? 1 : 0) +
    (votesById[id] === 1 ? 1 : 0);
  const downvotes =
    item.counts.downvotes -
    (item.my_vote === -1 ? 1 : 0) +
    (votesById[id] === -1 ? 1 : 0);

  return { upvotes, downvotes };
}
