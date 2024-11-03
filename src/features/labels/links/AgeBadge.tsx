import { styled } from "@linaria/react";
import { useMemo } from "react";

import { calculateIsCakeDay, calculateNewAccount } from "#/helpers/date";
import { useAppSelector } from "#/store";

const NewAccountBadge = styled.span`
  color: #d9a900;

  .ion-palette-dark & {
    color: gold;
  }
`;

interface AgeBadgeProps {
  published: string;
}

export default function AgeBadge({ published }: AgeBadgeProps) {
  const highlightNewAccount = useAppSelector(
    (state) => state.settings.general.comments.highlightNewAccount,
  );

  const ageBadgeData = useMemo(() => {
    const publishedDate = new Date(published);

    if (calculateIsCakeDay(publishedDate)) return { type: "cake" } as const;

    const days = calculateNewAccount(publishedDate);

    if (days !== undefined) {
      return { type: "new", days } as const;
    }
  }, [published]);

  if (!ageBadgeData) return;

  switch (ageBadgeData.type) {
    case "cake":
      return " 🍰";
    case "new": {
      if (!highlightNewAccount) return;

      return (
        <NewAccountBadge>
          {" "}
          👶 {formatDaysOld(ageBadgeData.days)}
        </NewAccountBadge>
      );
    }
  }
}

function formatDaysOld(days: number): string {
  switch (days) {
    case 0:
      return "<1d";
    default:
      return `${days}d`;
  }
}
