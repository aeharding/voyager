import styled from "@emotion/styled";
import { IonIcon } from "@ionic/react";
import {
  arrowUndoOutline,
  bookmarkOutline,
  linkOutline,
  shareOutline,
} from "ionicons/icons";
import { PostView } from "lemmy-js-client";
import { VoteButton } from "./VoteButton";
import { ActionButton } from "./post/actions/ActionButton";

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
}

export default function PostActions({ post }: PostActionsProps) {
  function share() {
    navigator.share({ url: post.post.ap_id });
  }

  return (
    <Container>
      <VoteButton type="up" postId={post.post.id} />
      <VoteButton type="down" postId={post.post.id} />
      <ActionButton>
        <IonIcon icon={bookmarkOutline} />
      </ActionButton>
      <ActionButton>
        <Link href={post.post.ap_id} target="_blank" rel="noopener noreferrer">
          <IonIcon icon={linkOutline} />
        </Link>
      </ActionButton>
      <ActionButton>
        <IonIcon icon={arrowUndoOutline} />
      </ActionButton>
      <ActionButton>
        <IonIcon icon={shareOutline} onClick={share} />
      </ActionButton>
    </Container>
  );
}
