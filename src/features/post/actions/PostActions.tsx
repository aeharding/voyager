import { IonIcon } from "@ionic/react";
import { styled } from "@linaria/react";
import { arrowUndoOutline, linkOutline } from "ionicons/icons";
import { PostView } from "lemmy-js-client";

import { SaveButton } from "#/features/post/shared/SaveButton";
import { VoteButton } from "#/features/post/shared/VoteButton";
import { getShareIcon } from "#/helpers/device";
import { share } from "#/helpers/lemmy";

import { ActionButton } from "./ActionButton";

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
        <IonIcon icon={getShareIcon()} onClick={() => share(post.post)} />
      </ActionButton>
    </Container>
  );
}
