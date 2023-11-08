import { Container, CustomIonItem, PositionedContainer } from "./Comment";
import styled from "@emotion/styled";
import CommentHr from "./CommentHr";
import { IonIcon } from "@ionic/react";
import { chevronForward } from "ionicons/icons";
import AnimateHeight from "react-animate-height";
import { CommentNodeI } from "../../helpers/lemmy";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import { useParams } from "react-router";

const MoreRepliesBlock = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  color: var(--ion-color-primary);
`;

const ChevronIcon = styled(IonIcon)`
  font-size: 1rem;
`;

interface CommentExpanderProps {
  depth: number;
  absoluteDepth?: number;
  collapsed?: boolean;
  comment: CommentNodeI;
}

export default function ContinueThread({
  depth,
  absoluteDepth,
  collapsed,
  comment,
}: CommentExpanderProps) {
  const { community, id: postId } = useParams<{
    community: string;
    id: string;
  }>();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  return (
    <AnimateHeight duration={200} height={collapsed ? 0 : "auto"}>
      <CommentHr depth={depth} />
      <CustomIonItem
        detail={false}
        routerLink={buildGeneralBrowseLink(
          `/c/${community}/comments/${postId}/thread/${comment.comment_view.comment.id}`,
        )}
      >
        <PositionedContainer
          depth={absoluteDepth === depth ? depth || 0 : (depth || 0) + 1}
          highlighted={false}
        >
          <Container depth={absoluteDepth ?? depth ?? 0}>
            <MoreRepliesBlock>
              Continue Thread...
              <ChevronIcon icon={chevronForward} />
            </MoreRepliesBlock>
          </Container>
        </PositionedContainer>
      </CustomIonItem>
    </AnimateHeight>
  );
}
