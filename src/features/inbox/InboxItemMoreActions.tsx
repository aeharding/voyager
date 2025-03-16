import { mailOutline, mailUnreadOutline } from "ionicons/icons";

import MoreActions from "#/features/comment/CommentEllipsis";
import { useAppDispatch, useAppSelector } from "#/store";

import { InboxItemView } from "./InboxItem";
import { getInboxItemId, markRead } from "./inboxSlice";
import PrivateMessageMoreActions from "./PrivateMessageMoreActions";

import styles from "./InboxItemMoreActions.module.css";

interface InboxItemMoreActionsProps {
  item: InboxItemView;

  ref: React.RefObject<InboxItemMoreActionsHandle | undefined>;
}

export interface InboxItemMoreActionsHandle {
  present: () => void;
}

export default function InboxItemMoreActions({
  item,
  ref,
}: InboxItemMoreActionsProps) {
  const dispatch = useAppDispatch();
  const readByInboxItemId = useAppSelector(
    (state) => state.inbox.readByInboxItemId,
  );
  const isRead = readByInboxItemId[getInboxItemId(item)];

  const markReadAction = {
    text: isRead ? "Mark Unread" : "Mark Read",
    icon: isRead ? mailUnreadOutline : mailOutline,
    handler: () => {
      dispatch(markRead(item, !isRead));
    },
  };

  return (
    <button className={styles.button}>
      {"person_mention" in item || "comment_reply" in item ? (
        <MoreActions
          comment={item}
          rootIndex={undefined}
          appendActions={[markReadAction]}
          ref={ref}
        />
      ) : (
        <PrivateMessageMoreActions
          item={item}
          markReadAction={markReadAction}
          ref={ref}
        />
      )}
    </button>
  );
}
