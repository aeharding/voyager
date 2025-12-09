import { arrowUpSharp } from "ionicons/icons";
import { arrowDownSharp } from "ionicons/icons";

import { formatNumber } from "#/helpers/number";
import { useCalculateTotalScore } from "#/helpers/vote";

import VoteStat from "../VoteStat";
import { useVote } from "./shared";
import { VoteProps } from "./Vote";

import styles from "./shared.module.css";

export default function TotalVoteMode({ item, ...rest }: VoteProps) {
  const score = useCalculateTotalScore(item);
  const { myVote, onVote } = useVote(item);

  return (
    <VoteStat
      button
      icon={myVote === -1 ? arrowDownSharp : arrowUpSharp}
      iconClassName={styles.icon}
      currentVote={myVote}
      onClick={async (e) => {
        await onVote(e, myVote ? 0 : 1);
      }}
      {...rest}
    >
      {formatNumber(score)}
    </VoteStat>
  );
}
