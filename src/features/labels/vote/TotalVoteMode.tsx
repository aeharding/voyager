import { arrowUpSharp } from "ionicons/icons";
import { arrowDownSharp } from "ionicons/icons";

import { formatNumber } from "#/helpers/number";
import { useCalculateTotalScore } from "#/helpers/vote";

import VoteStat from "../VoteStat";
import { useVote } from "./shared";
import { VoteModeProps } from "./shared";

import styles from "./shared.module.css";

export default function TotalVoteMode({ item, className }: VoteModeProps) {
  const score = useCalculateTotalScore(item);
  const { myVote, onVote } = useVote(item);

  return (
    <VoteStat
      button
      icon={myVote === -1 ? arrowDownSharp : arrowUpSharp}
      className={className}
      iconClassName={styles.icon}
      currentVote={myVote}
      onClick={async (e) => {
        await onVote(e, myVote ? 0 : 1);
      }}
    >
      {formatNumber(score)}
    </VoteStat>
  );
}
