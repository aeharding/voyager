import styled from "@emotion/styled";
import {
  IonButtons,
  IonButton,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  useIonToast,
  IonText,
} from "@ionic/react";
import {
  CommentReplyView,
  CommentView,
  PersonMentionView,
  PostView,
} from "lemmy-js-client";
import { useEffect, useState } from "react";
import ItemReplyingTo from "./ItemReplyingTo";
import useClient from "../../../helpers/useClient";
import { useAppDispatch, useAppSelector } from "../../../store";
import { Centered, Spinner } from "../../auth/Login";
import { handleSelector, jwtSelector } from "../../auth/authSlice";
import { css } from "@emotion/react";
import { preventPhotoswipeGalleryFocusTrap } from "../../gallery/GalleryImg";
import TextareaAutosizedForOnScreenKeyboard from "../../shared/TextareaAutosizedForOnScreenKeyboard";
import { receivedComments } from "../commentSlice";

export const Container = styled.div`
  min-height: 100%;

  display: flex;
  flex-direction: column;
`;

export const Textarea = styled(TextareaAutosizedForOnScreenKeyboard)`
  border: 0;
  background: none;
  resize: none;
  outline: 0;
  padding: 1rem;

  min-height: 200px;

  flex: 1 0 auto;

  ${({ theme }) =>
    !theme.dark &&
    css`
      .ios & {
        background: var(--ion-item-background);
      }
    `}
`;

export const UsernameIonText = styled(IonText)`
  font-size: 0.7em;
  font-weight: normal;
`;

export const TitleContainer = styled.div`
  line-height: 1;
`;

export type CommentReplyItem =
  | CommentView
  | PostView
  | PersonMentionView
  | CommentReplyView;

type CommentReplyProps = {
  dismiss: (reply?: CommentView | undefined) => void;
  setCanDismiss: (canDismiss: boolean) => void;
  item: CommentReplyItem;
};

export default function CommentReply({
  dismiss,
  setCanDismiss,
  item,
}: CommentReplyProps) {
  const comment = "comment" in item ? item.comment : undefined;

  const dispatch = useAppDispatch();
  const [replyContent, setReplyContent] = useState("");
  const client = useClient();
  const jwt = useAppSelector(jwtSelector);
  const [present] = useIonToast();
  const [loading, setLoading] = useState(false);
  const userHandle = useAppSelector(handleSelector);

  async function submit() {
    if (!jwt) return;

    setLoading(true);

    let reply;

    try {
      reply = await client.createComment({
        content: replyContent,
        parent_id: comment?.id,
        post_id: item.post.id,
        auth: jwt,
      });
    } catch (error) {
      const errorDescription =
        error === "language_not_allowed"
          ? "Please select a language in your lemmy profile settings."
          : "Please try again.";

      present({
        message: `Problem posting your comment. ${errorDescription}`,
        duration: 3500,
        position: "bottom",
        color: "danger",
      });

      throw error;
    } finally {
      setLoading(false);
    }

    present({
      message: "Comment posted!",
      duration: 3500,
      position: "bottom",
      color: "success",
    });

    dispatch(receivedComments([reply.comment_view]));
    setCanDismiss(true);
    // TODO is there a way to avoid a timeout here?
    await new Promise((resolve) => setTimeout(resolve, 100));
    dismiss(reply.comment_view);
  }

  useEffect(() => {
    setCanDismiss(!replyContent);
  }, [replyContent, setCanDismiss]);

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
              <TitleContainer>
                <IonText>New Comment</IonText>
                <div>
                  <UsernameIonText color="medium">{userHandle}</UsernameIonText>
                </div>
              </TitleContainer>{" "}
              {loading && <Spinner color="dark" />}
            </Centered>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              strong={true}
              type="submit"
              disabled={!replyContent.trim() || loading}
              onClick={submit}
            >
              Post
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent {...preventPhotoswipeGalleryFocusTrap}>
        <Container>
          <Textarea
            onChange={(e) => setReplyContent(e.target.value)}
            autoFocus
          />
          <ItemReplyingTo item={item} />
        </Container>
      </IonContent>
    </>
  );
}
