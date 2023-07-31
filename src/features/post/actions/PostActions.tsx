import styled from "@emotion/styled";
import { IonIcon } from "@ionic/react";
import { arrowUndoOutline, linkOutline, shareOutline } from "ionicons/icons";
import { PostView } from "lemmy-js-client";
import { VoteButton } from "../shared/VoteButton";
import { ActionButton } from "./ActionButton";
import { SaveButton } from "../shared/SaveButton";
import { share } from "../../../helpers/lemmy";

const Container = styled.div`
  display: flex;
  justify-content: space-around;
  color: var(--ion-color-primary);
  font-size: 1.5em;

  width: 100%;
`;

const Link = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface PostActionsProps {
  post: PostView;
  onReply: () => void;
}

export default function PostActions({ post, onReply }: PostActionsProps) {
  return (
    <Container>
      <VoteButton type="up" postId={post.post.id} />
      <VoteButton type="down" postId={post.post.id} />
      <SaveButton postId={post.post.id} />
      <ActionButton>
        <Link href={post.post.ap_id} target="_blank" rel="noopener noreferrer">
          <IonIcon icon={linkOutline} />
        </Link>
      </ActionButton>
      <ActionButton onClick={onReply}>
        <IonIcon icon={arrowUndoOutline} />
      </ActionButton>
      <ActionButton>
        <IonIcon icon={shareOutline} onClick={() => share(post.post)} />
      </ActionButton>
    </Container>
  );
}
