import { ComponentProps } from "react";

import Stat from "#/features/post/detail/Stat";
import {
  bgColorToVariable,
  VOTE_COLORS,
} from "#/features/settings/appearance/themes/votesTheme/VotesTheme";
import { VotesThemeType } from "#/services/db/types";
import { useAppSelector } from "#/store";

interface VoteStatProps extends ComponentProps<typeof Stat> {
  currentVote: 1 | -1 | 0;
  voteRepresented?: 1 | -1 | 0;
  colorized?: boolean;
}

export default function VoteStat({
  currentVote,
  voteRepresented,
  colorized = true,
  ...props
}: VoteStatProps) {
  const votesTheme = useAppSelector(
    (state) => state.settings.appearance.votesTheme,
  );

  return (
    <Stat
      {...props}
      style={
        colorized
          ? {
              color: buildStatColor(currentVote, voteRepresented, votesTheme),
            }
          : undefined
      }
    />
  );
}

function buildStatColor(
  currentVote: 1 | -1 | 0,
  voteRepresented: 1 | -1 | 0 | undefined,
  votesTheme: VotesThemeType,
) {
  if (voteRepresented === undefined || currentVote === voteRepresented) {
    switch (currentVote) {
      case 1:
        return bgColorToVariable(VOTE_COLORS.UPVOTE[votesTheme]);
      case -1:
        return bgColorToVariable(VOTE_COLORS.DOWNVOTE[votesTheme]);
    }
  }

  return "inherit";
}
