import { Person } from "lemmy-js-client";
import { useAppSelector } from "../../store";
import { getRemoteHandle } from "../../helpers/lemmy";
import { styled } from "@linaria/react";
import { getVoteWeightColor } from "./voteColor";
import { useIsDark } from "../../core/GlobalStyles";
import { formatNumber } from "../../helpers/number";

const ScoreContainer = styled.span`
  color: var(--ion-color-medium2);
`;

interface UserScoreProps {
  person: Person;
}

export default function UserScore({ person: user }: UserScoreProps) {
  const isDark = useIsDark();
  const tag = useAppSelector(
    (state) => state.userTag.tagByRemoteHandle[getRemoteHandle(user)],
  );

  if (!tag || tag === "pending") return;
  const score = tag.upvotes - tag.downvotes;
  if (score === 0) return;

  return (
    <ScoreContainer
      style={{
        [isDark ? "color" : "background"]: getVoteWeightColor(
          tag,
          isDark ? 0.8 : 1,
        ),
      }}
    >
      {" "}
      [{score > 0 ? "+" : ""}
      {formatNumber(score)}]
    </ScoreContainer>
  );
}
