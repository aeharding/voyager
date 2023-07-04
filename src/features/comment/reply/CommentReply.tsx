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
import { useAppSelector } from "../../../store";
import { Centered, Spinner } from "../../auth/Login";
import { handleSelector, jwtSelector } from "../../auth/authSlice";
import { css } from "@emotion/react";

export const Container = styled.div`
  position: absolute;
  inset: 0;

  display: flex;
  flex-direction: column;
`;

export const Textarea = styled.textarea`
  border: 0;
  background: none;
  resize: none;
  outline: 0;
  padding: 1rem;

  flex: 1 0 0;
  min-height: 7rem;

  ${({ theme }) =>
    !theme.dark &&
    css`
      .ios & {
        background: var(--ion-item-background);
      }
    `}
`;

const UsernameIonText = styled(IonText)`
  font-size: 0.7em;
  font-weight: normal;
`;

const TitleContainer = styled.div`
  line-height: 1;
`;

export type CommentReplyItem =
  | CommentView
  | PostView
  | PersonMentionView
  | CommentReplyView;

type CommentReplyProps = {
  dismiss: (replied: boolean) => void;
  setCanDismiss: (canDismiss: boolean) => void;
  item: CommentReplyItem;
};

export default function CommentReply({
  dismiss,
  setCanDismiss,
  item,
}: CommentReplyProps) {
  const comment = "comment" in item ? item.comment : undefined;

  const [replyContent, setReplyContent] = useState("");
  const client = useClient();
  const jwt = useAppSelector(jwtSelector);
  const [present] = useIonToast();
  const [loading, setLoading] = useState(false);
  const userHandle = useAppSelector(handleSelector);

  async function submit() {
    if (!jwt) return;

    setLoading(true);

    try {
      await client.createComment({
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

    // TODO is there a way to avoid a timeout here?
    setCanDismiss(true);
    setTimeout(() => dismiss(true), 100);
  }

  useEffect(() => {
    setCanDismiss(!replyContent);
  }, [replyContent, setCanDismiss]);

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton color="medium" onClick={() => dismiss(false)}>
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
      <IonContent>
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
