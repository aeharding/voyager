import { useMemo } from "react";

import { calculateNewAccountDays, isCakeDay } from "#/helpers/date";
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
    if (isCakeDay(published)) return { type: "cake" } as const;

    const days = calculateNewAccountDays(published);

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
