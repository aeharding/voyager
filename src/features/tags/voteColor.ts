import { CommentAggregates } from "lemmy-js-client";

// https://github.com/honestbleeps/Reddit-Enhancement-Suite/blob/e804618d97350d67cf0286283fc462756dc53d87/lib/modules/userTagger.js#L644
export function getVoteWeightColor(
  { upvotes, downvotes }: Pick<CommentAggregates, "upvotes" | "downvotes">,
  opacityMixin = 1,
) {
  const votes = upvotes - downvotes;

  let red = 255;
  let green = 255;
  let blue = 255;
  let alpha = 1;
  if (upvotes > downvotes) {
    red = Math.max(0, 255 - 8 * votes);
    green = 255;
    blue = Math.max(0, 255 - 8 * votes);
    alpha = Math.abs(votes) / (upvotes + downvotes);
  } else if (upvotes < downvotes) {
    red = 255;
    green = Math.max(0, 255 - Math.abs(8 * votes));
    blue = Math.max(0, 255 - Math.abs(8 * votes));
    alpha = Math.abs(votes) / (upvotes + downvotes);
  }

  const color = `rgba(${red}, ${green}, ${blue}, ${0.2 + alpha * 0.8 * opacityMixin})`;
  return color;
}
