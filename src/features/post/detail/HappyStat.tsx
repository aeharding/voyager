import { happyOutline } from "ionicons/icons";
import { PostView } from "lemmy-js-client";

import { useAppSelector } from "#/store";

import Stat from "./Stat";

interface HappyStatProps {
  post: PostView;
}

export default function HappyStat({ post }: HappyStatProps) {
  const storedVote =
    useAppSelector((state) => state.post.postVotesById[post.post.id]) ?? 0;

  function calculateVoteRatio() {
    const newUpvotes =
      post.counts.upvotes +
      (storedVote === 1 ? 1 : 0) -
      (post.my_vote === 1 ? 1 : 0);

    const newDownvotes =
      post.counts.downvotes +
      (storedVote === -1 ? 1 : 0) -
      (post.my_vote === -1 ? 1 : 0);

    const denominator = newUpvotes + newDownvotes;

    if (denominator === 0) {
      return 1;
    }

    return newUpvotes / denominator;
  }

  return (
    <Stat icon={happyOutline}>{Math.round(100 * calculateVoteRatio())}%</Stat>
  );
}
