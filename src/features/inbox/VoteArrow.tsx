import { IonIcon } from "@ionic/react";
import { arrowDown, arrowUp } from "ionicons/icons";

import {
  bgColorToVariable,
  VOTE_COLORS,
} from "#/features/settings/appearance/themes/votesTheme/VotesTheme";
import { useAppSelector } from "#/store";

import styles from "./VoteArrow.module.css";

interface VoteArrowProps {
  vote: 1 | 0 | -1 | undefined;
}

export default function VoteArrow({ vote }: VoteArrowProps) {
  const votesTheme = useAppSelector(
    (state) => state.settings.appearance.votesTheme,
  );

  if (!vote) return null;

  if (vote === 1)
    return (
      <div className={styles.container}>
        <IonIcon
          className={styles.voteIcon}
          icon={arrowUp}
          style={{ color: bgColorToVariable(VOTE_COLORS.UPVOTE[votesTheme]) }}
        />
      </div>
    );
  if (vote === -1)
    return (
      <div className={styles.container}>
        <IonIcon
          className={styles.voteIcon}
          icon={arrowDown}
          style={{ color: bgColorToVariable(VOTE_COLORS.DOWNVOTE[votesTheme]) }}
        />
      </div>
    );
}
