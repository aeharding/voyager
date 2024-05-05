import { ComponentProps, useMemo } from "react";
import { useAppSelector } from "../../store";
import Stat from "../post/detail/Stat";
import {
  VOTE_COLORS,
  bgColorToVariable,
} from "../settings/appearance/themes/votesTheme/VotesTheme";

interface VoteStatProps extends ComponentProps<typeof Stat> {
  currentVote: 1 | -1 | 0;
  voteRepresented?: 1 | -1 | 0;
}

export default function VoteStat({
  currentVote,
  voteRepresented,
  ...props
}: VoteStatProps) {
  const votesTheme = useAppSelector(
    (state) => state.settings.appearance.votesTheme,
  );

  const color = useMemo(() => {
    if (voteRepresented === undefined || currentVote === voteRepresented) {
      switch (currentVote) {
        case 1:
          return bgColorToVariable(VOTE_COLORS.UPVOTE[votesTheme]);
        case -1:
          return bgColorToVariable(VOTE_COLORS.DOWNVOTE[votesTheme]);
      }
    }

    return "inherit";
  }, [currentVote, voteRepresented, votesTheme]);

  return <Stat {...props} style={{ color }} />;
}
