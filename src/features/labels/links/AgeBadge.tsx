import { useMemo } from "react";

import { calculateIsCakeDay, calculateNewAccount } from "#/helpers/date";
import { useAppSelector } from "#/store";

import styles from "./AppBadge.module.css";

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
        <span className={styles.newAccountBadge}>
          {" "}
          👶 {formatDaysOld(ageBadgeData.days)}
        </span>
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
