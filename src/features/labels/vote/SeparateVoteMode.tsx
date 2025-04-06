import { arrowUpSharp } from "ionicons/icons";
import { arrowDownSharp } from "ionicons/icons";

import { formatNumber } from "#/helpers/number";
import { useCalculateSeparateScore } from "#/helpers/vote";

import VoteStat from "../VoteStat";
import { useVote } from "./shared";
import { VoteModeProps } from "./shared";

import styles from "./shared.module.css";

export default function SeparateVoteMode({ item, className }: VoteModeProps) {
  const { upvotes, downvotes } = useCalculateSeparateScore(item);
  const { myVote, onVote } = useVote(item);

  return (
    <>
      <VoteStat
        button
        icon={arrowUpSharp}
        className={className}
        iconClassName={styles.icon}
        currentVote={myVote}
        voteRepresented={1}
        onClick={async (e) => {
          await onVote(e, myVote === 1 ? 0 : 1);
        }}
      >
        {formatNumber(upvotes)}
      </VoteStat>
      <VoteStat
        button
        icon={arrowDownSharp}
        className={className}
        iconClassName={styles.icon}
        currentVote={myVote}
        voteRepresented={-1}
        onClick={async (e) => {
          await onVote(e, myVote === -1 ? 0 : -1);
        }}
      >
        {formatNumber(downvotes)}
      </VoteStat>
    </>
  );
}
