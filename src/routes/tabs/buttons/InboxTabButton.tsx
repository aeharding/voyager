import { IonBadge, IonIcon, IonLabel } from "@ionic/react";
import { fileTray } from "ionicons/icons";

import { totalUnreadSelector } from "#/features/inbox/inboxSlice";
import { formatNumber } from "#/helpers/number";
import { useAppSelector } from "#/store";

import SharedTabButton, { TabButtonProps } from "./shared";

function InboxTabButton(props: TabButtonProps) {
  const totalUnread = useAppSelector(totalUnreadSelector);
  const formattedTotalUnread = formatNumber(totalUnread, 10_000);
  const length = getBadgeLength(formattedTotalUnread);

  return (
    <SharedTabButton {...props}>
      <IonIcon aria-hidden="true" icon={fileTray} />
      <IonLabel>Inbox</IonLabel>
      {totalUnread ? (
        <IonBadge
          color="danger"
          style={length ? { marginLeft: `-${length}ch` } : undefined}
        >
          {formattedTotalUnread}
        </IonBadge>
      ) : undefined}
    </SharedTabButton>
  );
}

/**
 * Signal to Ionic that this is a tab bar button component
 */
InboxTabButton.isTabButton = true;

export default InboxTabButton;

function getBadgeLength(text: string) {
  const length = estimateChLength(text);
  return Math.max(0, length - 2);
}

const separators = [".", ","];

function estimateChLength(text: string) {
  return text.split("").reduce((acc, char) => {
    if (separators.includes(char)) {
      return acc + 0.3;
    }
    return acc + 1;
  }, 0);
}
