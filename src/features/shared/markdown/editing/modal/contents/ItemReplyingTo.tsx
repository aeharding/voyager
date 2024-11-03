import { IonIcon } from "@ionic/react";
import { styled } from "@linaria/react";
import { returnDownForwardSharp } from "ionicons/icons";
import { CommentView, PostView } from "lemmy-js-client";

import CommentContent from "#/features/comment/CommentContent";
import Ago from "#/features/labels/Ago";
import Edited from "#/features/labels/Edited";
import Vote from "#/features/labels/Vote";
import { preventModalSwipeOnTextSelection } from "#/helpers/ionic";
import { getHandle } from "#/helpers/lemmy";

const Container = styled.div`
  padding: 16px;
  background: var(--lightroom-bg);
  font-size: 0.875em;

  a {
    color: inherit !important;
    pointer-events: none;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ion-color-medium);
  font-size: 0.875em;
  margin-bottom: 8px;
`;

const StyledAgo = styled(Ago)`
  margin-left: auto;
`;

const CommentContentWrapper = styled.div`
  user-select: text;
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
        <Vote item={item} />
        <Edited item={item} />
        <StyledAgo date={payload.published} />
      </Header>
      <CommentContentWrapper {...preventModalSwipeOnTextSelection}>
        <CommentContent item={payload} showTouchFriendlyLinks={false} />
      </CommentContentWrapper>
    </Container>
  );
}
