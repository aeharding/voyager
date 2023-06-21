import styled from "@emotion/styled";
import { IonIcon, IonItem, useIonModal } from "@ionic/react";
import { chevronDownOutline } from "ionicons/icons";
import { CommentView } from "lemmy-js-client";
import { css } from "@emotion/react";
import React, { useContext } from "react";
import Ago from "../labels/Ago";
import { maxWidthCss } from "../shared/AppContent";
import PersonLink from "../labels/links/PersonLink";
import { ignoreSsrFlag } from "../../helpers/emotion";
import DraggingVote from "../shared/DraggingVote";
import { useAppDispatch, useAppSelector } from "../../store";
import Login from "../auth/Login";
import { PageContext } from "../auth/PageContext";
import { voteOnComment } from "./commentSlice";
import Vote from "../labels/Vote";
import AnimateHeight from "react-animate-height";
import CommentReply from "./reply/CommentReply";
import CommentContent from "./CommentContent";
import { PostContext } from "../post/detail/PostContext";
import useKeyPressed from "../../helpers/useKeyPressed";

const rainbowColors = [
  "#FF0000", // Red
  "#FF7F00", // Orange
  "#FFFF00", // Yellow
  "#00FF00", // Green
  "#0000FF", // Blue
  "#4B0082", // Indigo
  "#8B00FF", // Violet
  "#FF00FF", // Magenta
  "#FF1493", // Deep Pink
  "#00FFFF", // Cyan
];

const CustomIonItem = styled(IonItem)`
  --padding-start: 0;
  --inner-padding-end: 0;
  --border-style: none;
  --min-height: 0;
`;

const PositionedContainer = styled.div<{ depth: number; highlighted: boolean }>`
  ${maxWidthCss}

  padding: 0.55rem 1rem;

  ${({ highlighted }) =>
    highlighted &&
    css`
      background: var(--ion-color-light);
    `}

  @media (hover: none) {
    padding-top: 0.65rem;
    padding-bottom: 0.65rem;
  }

  ${({ depth }) =>
    css`
      padding-left: calc(0.5rem + ${Math.max(0, depth - 1) * 10}px);
    `}
`;

const Container = styled.div<{ depth: number; highlighted?: boolean }>`
  display: flex;

  position: relative;
  width: 100%;

  font-size: 0.9em;

  display: flex;
  flex-direction: column;

  ${({ depth }) =>
    depth > 0 &&
    css`
      padding-left: 1rem;
    `}

  &:before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    filter: brightness(0.7);

    ${({ depth }) =>
      depth &&
      css`
        background: ${rainbowColors[depth % rainbowColors.length]};
      `}
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;

  gap: 0.5rem;

  color: var(--ion-color-medium);
`;

const StyledPersonLabel = styled(PersonLink)`
  color: var(--ion-text-color);
`;

const Content = styled.div<{ keyPressed: boolean }>`
  padding-top: 0.35rem;

  @media (hover: none) {
    padding-top: 0.45rem;
  }

  line-height: 1.1;

  ${({ keyPressed }) =>
    keyPressed &&
    css`
      user-select: text;
    `}

  > *:first-child ${ignoreSsrFlag} {
    &,
    > p:first-child ${ignoreSsrFlag} {
      margin-top: 0;
    }
  }
  > *:last-child {
    &,
    > p:last-child {
      margin-bottom: 0;
    }
  }
`;

const CollapsedIcon = styled(IonIcon)`
  font-size: 1.2em;
`;

const AmountCollapsed = styled.div`
  font-size: 0.9em;
  padding: 0.25rem 0.5rem;
  margin: -0.25rem;
  border-radius: 1rem;
  color: var(--ion-color-medium);
  background: var(--ion-color-light);
`;

interface CommentProps {
  comment: CommentView;
  highlightedCommentId?: number;
  depth: number;
  onClick?: () => void;
  collapsed?: boolean;
  childCount: number;
  opId: number;
  fullyCollapsed: boolean;
  routerLink?: string;

  /** On profile view, this is used to show post replying to */
  context?: React.ReactNode;
}

export default function Comment({
  comment,
  highlightedCommentId,
  depth,
  onClick,
  collapsed,
  childCount,
  opId,
  fullyCollapsed,
  context,
  routerLink,
}: CommentProps) {
  const dispatch = useAppDispatch();

  const jwt = useAppSelector((state) => state.auth.jwt);
  const [login, onDismissLogin] = useIonModal(Login, {
    onDismiss: (data: string, role: string) => onDismissLogin(data, role),
  });
  const { refreshPost } = useContext(PostContext);
  const [reply, onDismissReply] = useIonModal(CommentReply, {
    onDismiss: (data: string, role: string) => {
      if (role === "post") refreshPost();
      onDismissReply(data, role);
    },
    comment,
  });
  const pageContext = useContext(PageContext);

  const keyPressed = useKeyPressed();

  const commentVotesById = useAppSelector(
    (state) => state.comment.commentVotesById
  );
  const currentVote = commentVotesById[comment.comment.id];

  function onVote(score: 1 | -1 | 0) {
    if (jwt) dispatch(voteOnComment(comment.comment.id, score));
    else login({ presentingElement: pageContext.page });
  }

  function onReply() {
    if (jwt) reply({ presentingElement: pageContext.page });
    else login({ presentingElement: pageContext.page });
  }

  return (
    <AnimateHeight duration={200} height={fullyCollapsed ? 0 : "auto"}>
      <DraggingVote onVote={onVote} currentVote={currentVote} onReply={onReply}>
        <CustomIonItem
          routerLink={routerLink}
          href={undefined}
          onClick={() => !keyPressed && onClick?.()}
        >
          <PositionedContainer
            depth={depth}
            highlighted={highlightedCommentId === comment.comment.id}
          >
            <Container depth={depth}>
              <Header>
                <StyledPersonLabel
                  person={comment.creator}
                  opId={opId}
                  distinguished={comment.comment.distinguished}
                />
                <Vote
                  voteFromServer={comment.my_vote as 1 | 0 | -1 | undefined}
                  score={comment.counts.score}
                  id={comment.comment.id}
                  type="comment"
                />
                <div style={{ flex: 1 }} />
                {!collapsed ? (
                  <>
                    <Ago date={comment.comment.published} />
                  </>
                ) : (
                  <>
                    <AmountCollapsed>{childCount}</AmountCollapsed>
                    <CollapsedIcon icon={chevronDownOutline} />
                  </>
                )}
              </Header>

              <AnimateHeight duration={200} height={collapsed ? 0 : "auto"}>
                <Content
                  keyPressed={keyPressed}
                  onClick={(e) => {
                    if (!(e.target instanceof HTMLElement)) return;
                    if (e.target.nodeName === "A") e.stopPropagation();
                  }}
                >
                  <CommentContent item={comment.comment} />
                  {context}
                </Content>
              </AnimateHeight>
            </Container>
          </PositionedContainer>
        </CustomIonItem>
      </DraggingVote>
    </AnimateHeight>
  );
}
