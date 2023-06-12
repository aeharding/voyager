import styled from "@emotion/styled";
import { IonIcon, IonItem } from "@ionic/react";
import { arrowUpSharp, chevronDownOutline } from "ionicons/icons";
import { CommentView } from "lemmy-js-client";
import { css } from "@emotion/react";
import Markdown from "./Markdown";

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
`;

const Container = styled.div<{ depth: number }>`
  position: relative;
  margin: 0.5rem 1rem;
  width: 100%;

  ${({ depth }) =>
    css`
      margin-left: calc(0.5rem + ${depth * 8}px);
    `}

  font-size: 0.9em;

  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &:before {
    content: "";
    position: absolute;
    left: -12px;
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
`;

const Content = styled.div`
  line-height: 1.1;

  > *:first-child {
    &,
    > p:first-child {
      margin-top: 0;
    }
  }
  > *:last-child {
    margin-bottom: 0;
  }
`;

const Votes = styled.div`
  display: flex;
  align-items: center;

  opacity: 0.5;
`;

const Ago = styled.div`
  opacity: 0.5;
`;

const CollapsedIcon = styled(IonIcon)`
  font-size: 1.2em;
  opacity: 0.5;
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
}

export default function Comment({
  comment,
  depth,
  onClick,
  collapsed,
  childCount,
}: CommentProps) {
  return (
    <CustomIonItem onClick={onClick}>
      <Container depth={depth}>
        <Header>
          {comment.creator.name}
          <Votes>
            <IonIcon icon={arrowUpSharp} />
            {comment.counts.score}
          </Votes>
          <div style={{ flex: 1 }} />
          {!collapsed ? (
            <>
              <Ago>5h</Ago>
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
            onClick={(e) => {
              if (!(e.target instanceof HTMLElement)) return;
              if (e.target.nodeName === "A") e.stopPropagation();
            }}
          >
            {comment.comment.deleted ? (
              <i>deleted by creator</i>
            ) : (
              <Markdown
                components={{
                  img: ({ node, ...props }) => (
                    <a
                      href={props.src}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {props.alt || "Image"}
                    </a>
                  ),
                }}
              >
                {comment.comment.content}
              </Markdown>
            )}
          </Content>
        )}
      </Container>
    </CustomIonItem>
  );
}
