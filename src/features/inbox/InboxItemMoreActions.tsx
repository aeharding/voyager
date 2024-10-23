import { mailOutline, mailUnreadOutline } from "ionicons/icons";
import { InboxItemView } from "./InboxItem";
import MoreActions from "../comment/CommentEllipsis";
import { useMemo } from "react";
import { styled } from "@linaria/react";
import { PlainButton } from "../shared/PlainButton";
import { useAppDispatch, useAppSelector } from "../../store";
import { getInboxItemId, markRead } from "./inboxSlice";
import PrivateMessageMoreActions from "./PrivateMessageMoreActions";

const StyledPlainButton = styled(PlainButton)`
  font-size: 1.12em;
`;

interface InboxItemMoreActionsProps {
  item: InboxItemView;

  ref: React.RefObject<InboxItemMoreActionsHandle>;
}

export type InboxItemMoreActionsHandle = {
  present: () => void;
};

export default function InboxItemMoreActions({
  item,
  ref,
}: InboxItemMoreActionsProps) {
  const dispatch = useAppDispatch();
  const readByInboxItemId = useAppSelector(
    (state) => state.inbox.readByInboxItemId,
  );
  const isRead = readByInboxItemId[getInboxItemId(item)];

  const markReadAction = useMemo(
    () => ({
      text: isRead ? "Mark Unread" : "Mark Read",
      icon: isRead ? mailUnreadOutline : mailOutline,
      handler: () => {
        dispatch(markRead(item, !isRead));
      },
    }),
    [dispatch, isRead, item],
  );

  return (
    <StyledPlainButton>
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
    </StyledPlainButton>
  );
}
