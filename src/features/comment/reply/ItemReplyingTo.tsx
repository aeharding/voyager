import styled from "@emotion/styled";
import { returnDownForwardSharp } from "ionicons/icons";
import { CommentView, PostView } from "lemmy-js-client";
import { getHandle } from "../../../helpers/lemmy";
import Vote from "../../labels/Vote";
import Ago from "../../labels/Ago";
import CommentContent from "../CommentContent";
import { IonIcon } from "@ionic/react";

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

interface ItemReplyingToProps {
  item: CommentView | PostView;
}

export default function ItemReplyingTo({ item }: ItemReplyingToProps) {
  const payload = "comment" in item ? item.comment : item.post;

  return (
    <Container>
      <Header>
        <IonIcon icon={returnDownForwardSharp} /> {getHandle(item.creator)}{" "}
        <Vote
          type="comment"
          id={payload.id}
          voteFromServer={item.my_vote as -1 | 0 | 1 | undefined}
          score={item.counts.score}
        />
        <StyledAgo date={payload.published} />
      </Header>
      <CommentContent item={payload} />
    </Container>
  );
}
