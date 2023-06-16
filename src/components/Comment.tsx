import styled from "@emotion/styled";
import {
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  ItemSlidingCustomEvent,
  useIonModal,
} from "@ionic/react";
import { arrowUpSharp, chevronDownOutline } from "ionicons/icons";
import { CommentView, Person } from "lemmy-js-client";
import { css } from "@emotion/react";
import Markdown from "./Markdown";
import { useContext, useRef, useState } from "react";
import Ago from "./Ago";
import { maxWidthCss } from "./AppContent";
import PersonLabel from "./PersonLabel";

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
`;

const PositionedContainer = styled.div<{ depth: number }>`
  ${maxWidthCss}

  padding: 0.55rem 1rem;

  ${({ depth }) =>
    css`
      padding-left: calc(0.5rem + ${Math.max(0, depth - 1) * 10}px);
    `}
`;

const Container = styled.div<{ depth: number }>`
  display: flex;

  position: relative;
  width: 100%;

  font-size: 0.9em;

  display: flex;
  flex-direction: column;
  gap: 0.55rem;

  ${({ depth }) =>
    depth &&
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

const StyledPersonLabel = styled(PersonLabel)`
  color: var(--ion-text-color);
`;

const Content = styled.div<{ keyPressed: boolean }>`
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
    margin-bottom: 0;
  }
`;

const CollapsedIcon = styled(IonIcon)`
  font-size: 1.2em;
`;

const AmountCollapsed = styled.div`
  font-size: 0.9em;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  color: var(--ion-color-medium);
  background: var(--ion-color-light);
`;

interface CommentProps {
  comment: CommentView;
  depth: number;
  onClick?: () => void;
  collapsed?: boolean;
  childCount: number;
  op: Person;
}

import { useEffect } from "react";
import { ignoreSsrFlag } from "../helpers/emotion";
import DraggingVote from "./DraggingVote";
import { useAppDispatch, useAppSelector } from "../store";
import Login from "../features/auth/Login";
import { PageContext } from "../features/auth/PageContext";
import { voteOnComment } from "../features/comment/commentSlice";
import Vote from "./Vote";

const useKeyPressed = (): boolean => {
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const handleDown = () => {
      setPressed(true);
    };
    const handleUp = () => {
      setPressed(false);
    };
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setPressed(false);
      }
    };

    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleUp);

    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleUp);
    };
  }, []);

  return pressed;
};

export default function Comment({
  comment,
  depth,
  onClick,
  collapsed,
  childCount,
  op,
}: CommentProps) {
  const dispatch = useAppDispatch();

  const jwt = useAppSelector((state) => state.auth.jwt);
  const [login, onDismiss] = useIonModal(Login, {
    onDismiss: (data: string, role: string) => onDismiss(data, role),
  });
  const pageContext = useContext(PageContext);

  const keyPressed = useKeyPressed();

  const commentVotesById = useAppSelector(
    (state) => state.comment.commentVotesById
  );
  const currentVote = commentVotesById[comment.comment.id];

  const score = comment.counts.score + (currentVote ?? 0);

  const content = (() => {
    if (comment.comment.deleted) return <i>deleted by creator</i>;
    if (comment.comment.removed) return <i>removed by mod</i>;

    return (
      <Markdown
        components={{
          img: ({ node, ...props }) => (
            <a href={props.src} target="_blank" rel="noopener noreferrer">
              {props.alt || "Image"}
            </a>
          ),
        }}
      >
        {comment.comment.content}
      </Markdown>
    );
  })();

  function onVote(score: 1 | -1 | 0) {
    if (jwt) dispatch(voteOnComment(comment.comment.id, score));
    else login({ presentingElement: pageContext.page });
  }

  return (
    <DraggingVote onVote={onVote} currentVote={currentVote}>
      <CustomIonItem onClick={() => !keyPressed && onClick?.()}>
        <PositionedContainer depth={depth}>
          <Container depth={depth}>
            <Header>
              <StyledPersonLabel
                person={comment.creator}
                op={op}
                distinguished={comment.comment.distinguished}
              />
              <Vote
                stats={comment.counts}
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
            {!collapsed && (
              <Content
                keyPressed={keyPressed}
                onClick={(e) => {
                  if (!(e.target instanceof HTMLElement)) return;
                  if (e.target.nodeName === "A") e.stopPropagation();
                }}
              >
                {content}
              </Content>
            )}
          </Container>
        </PositionedContainer>
      </CustomIonItem>
    </DraggingVote>
  );
}
