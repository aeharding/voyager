import { IonBadge, IonIcon, IonLabel } from "@ionic/react";
import { useAppSelector } from "../../../store";
import SharedTabButton, { TabButtonProps } from "./shared";
import { fileTray } from "ionicons/icons";
import { totalUnreadSelector } from "../../../features/inbox/inboxSlice";

function InboxTabButton(props: TabButtonProps) {
  const totalUnread = useAppSelector(totalUnreadSelector);

  return (
    <SharedTabButton {...props}>
      <IonIcon aria-hidden="true" icon={fileTray} />
      <IonLabel>Inbox</IonLabel>
      {totalUnread ? (
        <IonBadge color="danger">{totalUnread}</IonBadge>
      ) : undefined}
    </SharedTabButton>
  );
}

/**
 * Signal to Ionic that this is a tab bar button component
 */
InboxTabButton.isTabButton = true;

export default InboxTabButton;
