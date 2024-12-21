import { IonChip } from "@ionic/react";

import {
  ServerCategory,
  SERVERS_BY_CATEGORY,
} from "#/features/auth/login/data/servers";

import styles from "./Filters.module.css";

const CATEGORIES = Object.keys(SERVERS_BY_CATEGORY) as ServerCategory[];

interface FiltersProps {
  hasRecommended: boolean;
  category: ServerCategory;
  setCategory: (category: ServerCategory) => void;
}

export default function Filters({
  hasRecommended,
  category,
  setCategory,
}: FiltersProps) {
  return (
    <div
      className={styles.container}
      onTouchMoveCapture={(e) => {
        // Prevent page swipes
        e.stopPropagation();
        return true;
      }}
    >
      {hasRecommended && (
        <IonChip
          className={
            category === "recommended" ? styles.selectedChip : undefined
          }
          outline={category !== "recommended"}
          onClick={() => setCategory("recommended")}
        >
          recommended
        </IonChip>
      )}
      {CATEGORIES.map((c) => (
        <IonChip
          className={category === c ? styles.selectedChip : undefined}
          key={c}
          outline={category !== c}
          onClick={() => setCategory(c)}
        >
          {c}
        </IonChip>
      ))}
    </div>
  );
}
