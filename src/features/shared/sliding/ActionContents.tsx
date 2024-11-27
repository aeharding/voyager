import { IonIcon } from "@ionic/react";
import { bookmark, mailUnread } from "ionicons/icons";

import { sv } from "#/helpers/css";

import { SlidingItemAction } from "./SlidingItem";

import styles from "./ActionContents.module.css";

const custom_slash_lengths: Record<string, number> = {
  [bookmark]: 35,
  [mailUnread]: 40,
};

interface ActionContentsProps {
  action: SlidingItemAction | undefined;
}

export default function ActionContents({ action }: ActionContentsProps) {
  if (!action) return;

  return (
    <IonIcon
      className={styles.icon}
      icon={action.icon}
      style={sv({
        bgColorVar: `var(--ion-color-${action.bgColor}`,
        slash: action.slash ? '""' : "none",
        slashHeight: `${custom_slash_lengths[action.icon] ?? 30}px`,
      })}
    />
  );
}
