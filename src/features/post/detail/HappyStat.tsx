import { happyOutline } from "ionicons/icons";
import { PostView } from "threadiverse";

import { useCalculateSeparateScore } from "#/helpers/vote";

import Stat from "./Stat";

interface HappyStatProps {
  post: PostView;
}

export default function HappyStat({ post }: HappyStatProps) {
  const { upvotes, downvotes } = useCalculateSeparateScore(post);

  function calculateVoteRatio() {
    const denominator = upvotes + downvotes;

    if (denominator === 0) {
      return 1;
    }

    return upvotes / denominator;
  }

  return (
    <Stat icon={happyOutline}>{Math.round(100 * calculateVoteRatio())}%</Stat>
  );
}
