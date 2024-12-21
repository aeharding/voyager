import {
  IonButton,
  IonButtons,
  IonIcon,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { arrowBackSharp, send } from "ionicons/icons";
import { Comment, CommentView } from "lemmy-js-client";
import { useEffect, useState } from "react";

import { editComment } from "#/features/comment/commentSlice";
import { isIosTheme } from "#/helpers/device";
import { commentEdited } from "#/helpers/toastMessages";
import useAppToast from "#/helpers/useAppToast";
import { useAppDispatch } from "#/store";

import AppHeader from "../../../../AppHeader";
import { DismissableProps } from "../../../../DynamicDismissableModal";
import CommentEditorContent from "./CommentEditorContent";

type CommentEditPageProps = Omit<DismissableProps, "dismiss"> & {
  dismiss: (reply?: CommentView | undefined) => void;
  item: Comment;
};

export default function CommentEditPage({
  item,
  setCanDismiss,
  dismiss,
}: CommentEditPageProps) {
  const dispatch = useAppDispatch();
  const [replyContent, setReplyContent] = useState(item.content);
  const presentToast = useAppToast();
  const [loading, setLoading] = useState(false);
  const isSubmitDisabled =
    !replyContent.trim() || item.content === replyContent || loading;

  useEffect(() => {
    setCanDismiss(item.content === replyContent);
  }, [replyContent, item, setCanDismiss]);

  async function submit() {
    if (isSubmitDisabled) return;

    setLoading(true);

    let comment;

    try {
      comment = await dispatch(editComment(item.id, replyContent));
    } catch (error) {
      presentToast({
        message: "Problem saving your changes. Please try again.",
        color: "danger",
        fullscreen: true,
      });

      throw error;
    } finally {
      setLoading(false);
    }

    presentToast(commentEdited);

    setCanDismiss(true);
    dismiss(comment);
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
          <IonTitle>Edit Comment</IonTitle>
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
                  "Save"
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
