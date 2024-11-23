import {
  IonButton,
  IonButtons,
  IonIcon,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { arrowBackSharp, send } from "ionicons/icons";
import { Person, PrivateMessageView } from "lemmy-js-client";
import { useEffect, useState } from "react";

import { receivedMessages } from "#/features/inbox/inboxSlice";
import AppHeader from "#/features/shared/AppHeader";
import { DismissableProps } from "#/features/shared/DynamicDismissableModal";
import { isIosTheme } from "#/helpers/device";
import { getHandle } from "#/helpers/lemmy";
import { messageSent, privateMessageSendFailed } from "#/helpers/toastMessages";
import useAppToast from "#/helpers/useAppToast";
import useClient from "#/helpers/useClient";
import { useAppDispatch } from "#/store";

import CommentEditorContent from "./CommentEditorContent";

/**
 * Special case to compose a private message
 * (everything else has a Lemmy type for context-
 * e.g. post or comment replying to,
 * but not necessarily DMs)
 */
export interface NewPrivateMessage {
  private_message: {
    recipient: Person;
  };

  /**
   * Prefilled content
   */
  value?: string;
}

type CommentEditingProps = Omit<DismissableProps, "dismiss"> & {
  dismiss: (reply?: PrivateMessageView | undefined) => void;
  item: NewPrivateMessage;
};

export default function PrivateMessagePage({
  item,
  setCanDismiss,
  dismiss,
}: CommentEditingProps) {
  const client = useClient();
  const dispatch = useAppDispatch();
  const [replyContent, setReplyContent] = useState(item.value ?? "");
  const presentToast = useAppToast();
  const [loading, setLoading] = useState(false);
  const isSubmitDisabled = !replyContent.trim() || loading;

  useEffect(() => {
    setCanDismiss(!replyContent);
  }, [replyContent, setCanDismiss]);

  async function submit() {
    if (isSubmitDisabled) return;

    setLoading(true);

    let message;

    try {
      message = await client.createPrivateMessage({
        content: replyContent,
        recipient_id: item.private_message.recipient.id,
      });
    } catch (error) {
      presentToast(privateMessageSendFailed);

      throw error;
    } finally {
      setLoading(false);
    }

    presentToast(messageSent);

    setCanDismiss(true);
    dismiss(message.private_message_view);
    dispatch(receivedMessages([message.private_message_view]));
  }

  return (
    <>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => dismiss()}>
              {isIosTheme() ? (
                "Cancel"
              ) : (
                <IonIcon icon={arrowBackSharp} slot="icon-only" />
              )}
            </IonButton>
          </IonButtons>
          <IonTitle>To {getHandle(item.private_message.recipient)}</IonTitle>
          <IonButtons slot="end">
            {loading ? (
              <IonSpinner />
            ) : (
              <IonButton
                strong
                type="submit"
                disabled={isSubmitDisabled}
                color={isSubmitDisabled ? "medium" : undefined}
                onClick={submit}
              >
                {isIosTheme() ? (
                  "Send"
                ) : (
                  <IonIcon icon={send} slot="icon-only" />
                )}
              </IonButton>
            )}
          </IonButtons>
        </IonToolbar>
      </AppHeader>

      <CommentEditorContent
        text={replyContent}
        setText={setReplyContent}
        onSubmit={submit}
        onDismiss={dismiss}
      />
    </>
  );
}
