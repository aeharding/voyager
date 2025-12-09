import { arrowUpSharp } from "ionicons/icons";
import { arrowDownSharp } from "ionicons/icons";

import { formatNumber } from "#/helpers/number";
import { useCalculateSeparateScore } from "#/helpers/vote";

import VoteStat from "../VoteStat";
import { useVote } from "./shared";
import { VoteProps } from "./Vote";

import styles from "./shared.module.css";

export default function SeparateVoteMode({ item, ...rest }: VoteProps) {
  const { upvotes, downvotes } = useCalculateSeparateScore(item);
  const { myVote, onVote } = useVote(item);

  return (
    <>
      <VoteStat
        button
        icon={arrowUpSharp}
        iconClassName={styles.icon}
        currentVote={myVote}
        voteRepresented={1}
        onClick={async (e) => {
          await onVote(e, myVote === 1 ? 0 : 1);
        }}
        {...rest}
      >
        {formatNumber(upvotes)}
      </VoteStat>
      <VoteStat
        button
        icon={arrowDownSharp}
        iconClassName={styles.icon}
        currentVote={myVote}
        voteRepresented={-1}
        onClick={async (e) => {
          await onVote(e, myVote === -1 ? 0 : -1);
        }}
        {...rest}
      >
        {formatNumber(downvotes)}
      </VoteStat>
    </>
  );
}
