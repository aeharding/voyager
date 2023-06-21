import styled from "@emotion/styled";
import {
  IonButtons,
  IonButton,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  IonPage,
  useIonToast,
  IonText,
} from "@ionic/react";
import { CommentView, PostView } from "lemmy-js-client";
import { useState } from "react";
import ItemReplyingTo from "./ItemReplyingTo";
import useClient from "../../helpers/useClient";
import { useAppSelector } from "../../store";
import { Centered, Spinner } from "../auth/Login";
import { handleSelector } from "../auth/authSlice";

const Container = styled.div`
  position: absolute;
  inset: 0;

  display: flex;
  flex-direction: column;
`;

const Textarea = styled.textarea`
  border: 0;
  background: none;
  resize: none;
  outline: 0;
  padding: 1rem;

  flex: 1 0 0;
  min-height: 7rem;
`;

const UsernameIonText = styled(IonText)`
  font-size: 0.7em;
  font-weight: normal;
`;

const TitleContainer = styled.div`
  line-height: 1;
`;

export default function CommentReply({
  onDismiss,
  comment,
  post,
}: {
  onDismiss: (data?: string, role?: string) => void;
  comment?: CommentView;
  post?: PostView;
}) {
  const [replyContent, setReplyContent] = useState("");
  const client = useClient();
  const jwt = useAppSelector((state) => state.auth.jwt);
  const [present] = useIonToast();
  const [loading, setLoading] = useState(false);
  const userHandle = useAppSelector(handleSelector);

  async function submit() {
    if (!jwt) return;

    setLoading(true);

    try {
      await client.createComment({
        content: replyContent,
        parent_id: comment?.comment.id,
        post_id: (comment?.post.id ?? post?.post.id)!,
        auth: jwt,
      });
    } catch (error) {
      present({
        message: "Problem posting your comment. Please try again.",
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

    onDismiss(undefined, "post");
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton color="medium" onClick={() => onDismiss()}>
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
          <ItemReplyingTo item={(comment ?? post)!} />
        </Container>
      </IonContent>
    </IonPage>
  );
}
