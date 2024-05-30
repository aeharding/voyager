import {
  ellipsisHorizontal,
  flagOutline,
  personOutline,
  removeCircleOutline,
  textOutline,
} from "ionicons/icons";
import { ActionSheetButton, IonIcon, useIonActionSheet } from "@ionic/react";
import { useCallback, useContext, useImperativeHandle } from "react";
import { PageContext } from "../auth/PageContext";
import useAppNavigation from "../../helpers/useAppNavigation";
import { useUserDetails } from "../user/useUserDetails";
import { getHandle } from "../../helpers/lemmy";
import { PrivateMessageView } from "lemmy-js-client";
import { styled } from "@linaria/react";

const StyledIonIcon = styled(IonIcon)`
  font-size: 1.2em;
`;

interface PrivateMessageMoreActionsHandle {
  present: () => void;
}

interface PrivateMessageMoreActionsProps {
  item: PrivateMessageView;
  markReadAction: ActionSheetButton;

  ref: React.RefObject<PrivateMessageMoreActionsHandle>;
}

export default function PrivateMessageMoreActions({
  item,
  markReadAction,
  ref,
}: PrivateMessageMoreActionsProps) {
  const [presentActionSheet] = useIonActionSheet();
  const { presentReport, presentSelectText } = useContext(PageContext);

  const { navigateToUser } = useAppNavigation();

  const { isBlocked, blockOrUnblock } = useUserDetails(getHandle(item.creator));

  const present = useCallback(() => {
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
  }, [
    blockOrUnblock,
    isBlocked,
    markReadAction,
    navigateToUser,
    presentActionSheet,
    presentReport,
    presentSelectText,
    item,
  ]);

  useImperativeHandle(
    ref,
    () => ({
      present,
    }),
    [present],
  );

  return (
    <StyledIonIcon
      icon={ellipsisHorizontal}
      onClick={(e) => {
        e.stopPropagation();
        present();
      }}
    />
  );
}
