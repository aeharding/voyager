import styled from "@emotion/styled";
import { IonIcon } from "@ionic/react";
import {
  returnDownForward,
  returnDownForwardOutline,
  returnDownForwardSharp,
} from "ionicons/icons";
import { CommentView } from "lemmy-js-client";
import { getHandle } from "../../helpers/lemmy";
import Vote from "../../components/Vote";
import Ago from "../../components/Ago";
import CommentContent from "../../components/CommentContent";

const Container = styled.div`
  padding: 1rem;
  background: var(--ion-color-light);
  pointer-events: none;
  font-size: 0.9em;

  a {
    color: inherit !important;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--ion-color-medium);
  font-size: 0.9em;
  margin-bottom: 0.5rem;
`;

const StyledAgo = styled(Ago)`
  margin-left: auto;
`;

interface CommentReplyingToProps {
  comment: CommentView;
}

export default function CommentReplyingTo({ comment }: CommentReplyingToProps) {
  return (
    <Container>
      <Header>
        <IonIcon icon={returnDownForwardSharp} /> {getHandle(comment.creator)}{" "}
        <Vote
          type="comment"
          id={comment.comment.id}
          voteFromServer={comment.my_vote as -1 | 0 | 1 | undefined}
          score={comment.counts.score}
        />
        <StyledAgo date={comment.comment.published} />
      </Header>
      <CommentContent comment={comment} />
    </Container>
  );
}
