import { IonIcon } from "@ionic/react";
import { styled } from "@linaria/react";
import { arrowDown, arrowUp } from "ionicons/icons";

import {
  bgColorToVariable,
  VOTE_COLORS,
} from "#/features/settings/appearance/themes/votesTheme/VotesTheme";
import { useAppSelector } from "#/store";

const Container = styled.div`
  font-size: 1.4em;

  width: 100%;
  height: 1rem;

  position: relative;
`;

const VoteIcon = styled(IonIcon)`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

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
      <Container>
        <VoteIcon
          icon={arrowUp}
          style={{ color: bgColorToVariable(VOTE_COLORS.UPVOTE[votesTheme]) }}
        />
      </Container>
    );
  if (vote === -1)
    return (
      <Container>
        <VoteIcon
          icon={arrowDown}
          style={{ color: bgColorToVariable(VOTE_COLORS.DOWNVOTE[votesTheme]) }}
        />
      </Container>
    );
}
