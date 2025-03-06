import { ActionSheetButton, IonIcon } from "@ionic/react";
import {
  arrowUndoOutline,
  ellipsisHorizontal,
  flagOutline,
  personOutline,
  textOutline,
} from "ionicons/icons";
import { PrivateMessageView } from "lemmy-js-client";
import { useCallback, useContext, useImperativeHandle } from "react";

import { PageContext } from "#/features/auth/PageContext";
import usePresentUserActions from "#/features/user/usePresentUserActions";
import { getHandle } from "#/helpers/lemmy";
import useAppNavigation from "#/helpers/useAppNavigation";
import store, { useAppDispatch } from "#/store";

import { markRead, syncMessages } from "./inboxSlice";

import styles from "./PrivateMessageMoreActions.module.css";

interface PrivateMessageMoreActionsHandle {
  present: () => void;
}

interface PrivateMessageMoreActionsProps {
  item: PrivateMessageView;
  markReadAction: ActionSheetButton;

  ref: React.RefObject<PrivateMessageMoreActionsHandle | undefined>;
}

export default function PrivateMessageMoreActions({
  item,
  markReadAction,
  ref,
}: PrivateMessageMoreActionsProps) {
  const dispatch = useAppDispatch();
  const { presentReport, presentSelectText, presentPrivateMessageCompose } =
    useContext(PageContext);

  const presentUserActions = usePresentUserActions();
  const { navigateToUser } = useAppNavigation();

  const present = useCallback(() => {
    presentUserActions(item.creator, {
      prependButtons: [
        markReadAction,
        {
          text: "Reply",
          icon: arrowUndoOutline,
          handler: () => {
            (async () => {
              await presentPrivateMessageCompose({
                private_message: {
                  recipient:
                    item.private_message.creator_id ===
                    store.getState().site.response?.my_user?.local_user_view
                      ?.local_user?.person_id
                      ? item.recipient
                      : item.creator,
                },
              });

              await dispatch(markRead(item, true));
              dispatch(syncMessages());
            })();
          },
        },
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
      ],
    });
  }, [
    dispatch,
    item,
    markReadAction,
    navigateToUser,
    presentPrivateMessageCompose,
    presentReport,
    presentSelectText,
    presentUserActions,
  ]);

  useImperativeHandle(
    ref,
    () => ({
      present,
    }),
    [present],
  );

  return (
    <IonIcon
      className={styles.icon}
      icon={ellipsisHorizontal}
      onClick={(e) => {
        e.stopPropagation();
        present();
      }}
    />
  );
}
