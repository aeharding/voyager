import {
  IonButtons,
  IonButton,
  IonHeader,
  IonToolbar,
  IonTitle,
} from "@ionic/react";
import { Comment } from "lemmy-js-client";
import { useEffect, useState } from "react";
import { useAppDispatch } from "../../../../store";
import { Centered, Spinner } from "../../../auth/Login";
import { editComment } from "../../commentSlice";
import { DismissableProps } from "../../../shared/DynamicDismissableModal";
import CommentContent from "../shared";
import useAppToast from "../../../../helpers/useAppToast";

type CommentEditingProps = DismissableProps & {
  item: Comment;
};

export default function CommentEdit({
  item,
  setCanDismiss,
  dismiss,
}: CommentEditingProps) {
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

    try {
      await dispatch(editComment(item.id, replyContent));
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

    presentToast({
      message: "Comment edited!",
      color: "primary",
      position: "top",
      centerText: true,
      fullscreen: true,
    });

    setCanDismiss(true);
    await new Promise((resolve) => setTimeout(resolve, 100));
    dismiss();
  }

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton color="medium" onClick={() => dismiss()}>
              Cancel
            </IonButton>
          </IonButtons>
          <IonTitle>
            <Centered>
              Edit Comment
              {loading && <Spinner color="dark" />}
            </Centered>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              strong={true}
              type="submit"
              disabled={isSubmitDisabled}
              onClick={submit}
            >
              Save
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <CommentContent
        text={replyContent}
        setText={setReplyContent}
        onSubmit={submit}
      />
    </>
  );
}
