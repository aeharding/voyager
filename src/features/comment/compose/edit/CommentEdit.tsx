import {
  IonButtons,
  IonButton,
  IonHeader,
  IonToolbar,
  IonTitle,
  useIonToast,
} from "@ionic/react";
import { Comment } from "lemmy-js-client";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { Centered, Spinner } from "../../../auth/Login";
import { jwtSelector } from "../../../auth/authSlice";
import { editComment } from "../../commentSlice";
import { DismissableProps } from "../../../shared/DynamicDismissableModal";
import CommentContent from "../shared";

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
  const jwt = useAppSelector(jwtSelector);
  const [present] = useIonToast();
  const [loading, setLoading] = useState(false);
  const isSubmitDisabled =
    !replyContent.trim() || item.content === replyContent || loading;

  useEffect(() => {
    setCanDismiss(item.content === replyContent);
  }, [replyContent, item, setCanDismiss]);

  async function submit() {
    if (isSubmitDisabled) return;
    if (!jwt) return;

    setLoading(true);

    try {
      await dispatch(editComment(item.id, replyContent));
    } catch (error) {
      present({
        message: "Problem saving your changes. Please try again.",
        duration: 3500,
        position: "bottom",
        color: "danger",
      });

      throw error;
    } finally {
      setLoading(false);
    }

    present({
      message: "Comment edited!",
      duration: 3500,
      position: "bottom",
      color: "success",
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
        submit={submit}
      />
    </>
  );
}
