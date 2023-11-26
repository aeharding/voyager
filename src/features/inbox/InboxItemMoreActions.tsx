import styled from "@emotion/styled";
import { IonIcon, useIonActionSheet } from "@ionic/react";
import {
  ellipsisHorizontal,
  flagOutline,
  mailOutline,
  mailUnreadOutline,
  personOutline,
  removeCircleOutline,
  textOutline,
} from "ionicons/icons";
import { InboxItemView } from "./InboxItem";
import { PrivateMessageView } from "lemmy-js-client";
import MoreActions from "../comment/CommentEllipsis";
import { useAppDispatch, useAppSelector } from "../../store";
import { getInboxItemId, markRead } from "./inboxSlice";
import { getHandle } from "../../helpers/lemmy";
import { useContext } from "react";
import { PageContext } from "../auth/PageContext";
import useAppNavigation from "../../helpers/useAppNavigation";
import { useUserDetails } from "../user/useUserDetails";
import useCanModerate from "../moderation/useCanModerate";

const EllipsisIcon = styled(IonIcon)`
  font-size: 1.2rem;
`;

interface InboxItemMoreActions {
  item: InboxItemView;
}

export default function InboxItemMoreActions({ item }: InboxItemMoreActions) {
  const dispatch = useAppDispatch();
  const [presentActionSheet] = useIonActionSheet();
  const { presentReport, presentSelectText } = useContext(PageContext);

  const { navigateToUser } = useAppNavigation();

  const readByInboxItemId = useAppSelector(
    (state) => state.inbox.readByInboxItemId,
  );

  const { isBlocked, blockOrUnblock } = useUserDetails(getHandle(item.creator));

  const canModerate = useCanModerate(
    "community" in item ? item.community : undefined,
  );

  const isRead = readByInboxItemId[getInboxItemId(item)];

  const markReadAction = {
    text: isRead ? "Mark Unread" : "Mark Read",
    icon: isRead ? mailUnreadOutline : mailOutline,
    handler: () => {
      dispatch(markRead(item, !isRead));
    },
  };

  function presentMessage(item: PrivateMessageView) {
    presentActionSheet({
      cssClass: "left-align-buttons",
      buttons: [
        markReadAction,
        {
          text: "Select Text",
          icon: textOutline,
          handler: () => {
            presentSelectText(item.private_message.content);
          },
        },
        {
          text: getHandle(item.creator),
          icon: personOutline,
          handler: () => {
            navigateToUser(item.creator);
          },
        },
        {
          text: "Report",
          icon: flagOutline,
          handler: () => {
            presentReport(item);
          },
        },
        {
          text: !isBlocked ? "Block User" : "Unblock User",
          icon: removeCircleOutline,
          handler: () => {
            blockOrUnblock();
          },
        },
        {
          text: "Cancel",
          role: "cancel",
        },
      ],
    });
  }

  if ("person_mention" in item || "comment_reply" in item) {
    return (
      <MoreActions
        comment={item}
        rootIndex={undefined}
        appendActions={[markReadAction]}
        canModerate={canModerate}
      />
    );
  }

  return (
    <EllipsisIcon
      icon={ellipsisHorizontal}
      onClick={(e) => {
        e.stopPropagation();
        presentMessage(item);
      }}
    />
  );
}
