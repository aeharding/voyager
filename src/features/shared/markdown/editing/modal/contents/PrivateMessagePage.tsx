import {
  IonButtons,
  IonButton,
  IonToolbar,
  IonTitle,
  IonIcon,
} from "@ionic/react";
import { Person, PrivateMessageView } from "lemmy-js-client";
import { useEffect, useState } from "react";
import { arrowBackSharp, send } from "ionicons/icons";
import { DismissableProps } from "../../../../DynamicDismissableModal";
import { useAppDispatch } from "../../../../../../store";
import useAppToast from "../../../../../../helpers/useAppToast";
import AppHeader from "../../../../AppHeader";
import { isIosTheme } from "../../../../../../helpers/device";
import { Centered, Spinner } from "../../../../../auth/login/LoginNav";
import CommentEditorContent from "./CommentEditorContent";
import useClient from "../../../../../../helpers/useClient";
import { privateMessageSendFailed } from "../../../../../../helpers/toastMessages";
import { receivedMessages } from "../../../../../inbox/inboxSlice";
import { getHandle } from "../../../../../../helpers/lemmy";
import { styled } from "@linaria/react";

const Title = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
`;

/**
 * Special case to compose a private message
 * (everything else has a Lemmy type for context-
 * e.g. post or comment replying to,
 * but not necessarily DMs)
 */
export type NewPrivateMessage = {
  private_message: {
    recipient: Person;
  };

  /**
   * Prefilled content
   */
  value?: string;
};

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

    presentToast({
      message: "Message sent!",
      color: "primary",
      position: "top",
      centerText: true,
      fullscreen: true,
    });

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
          <IonTitle>
            <Centered>
              <Title>To {getHandle(item.private_message.recipient)}</Title>
              {loading && <Spinner color="dark" />}
            </Centered>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              strong
              type="submit"
              disabled={isSubmitDisabled}
              color={isSubmitDisabled ? "medium" : undefined}
              onClick={submit}
            >
              {isIosTheme() ? "Send" : <IonIcon icon={send} slot="icon-only" />}
            </IonButton>
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
