import styled from "@emotion/styled";
import { CommentNodeI, getFlattenedChildren } from "../helpers/lemmy";
import Comment from "./Comment";
import { useMemo, useState } from "react";
import { maxWidthCss } from "./AppContent";
import { css } from "@emotion/react";
import { Person } from "lemmy-js-client";

const HrContainer = styled.div<{ depth: number }>`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  ${maxWidthCss}
  z-index: 100;

  ${({ depth }) =>
    css`
      padding-left: calc(0.5rem + ${(depth - 1) * 10}px);
    `}
`;

const Hr = styled.hr`
  flex: 1;
  height: 0.55px;
  background-color: var(
    --ion-item-border-color,
    var(--ion-border-color, var(--ion-color-step-250, #c8c7cc))
  );
  width: 100%;
  margin: 0;
`;

interface CommentTreeProps {
  comment: CommentNodeI;
  first?: boolean;
  op: Person;
}

export default function CommentTree({ comment, first, op }: CommentTreeProps) {
  const [collapsed, setCollapsed] = useState(false);
  const childCount = useMemo(
    () => getFlattenedChildren(comment).length,
    [comment]
  );

  return (
    <>
      {!first && (
        <HrContainer depth={comment.depth}>
          <Hr />
        </HrContainer>
      )}
      <Comment
        comment={comment.comment_view}
        depth={comment.depth}
        onClick={() => setCollapsed(!collapsed)}
        collapsed={collapsed}
        childCount={childCount}
        op={op}
      />
      {!collapsed &&
        comment.children.map((comment) => (
          <CommentTree
            key={comment.comment_view.comment.id}
            comment={comment}
            op={op}
          />
        ))}
      {comment.comment_view.counts.child_count > childCount && (
        <div>
          {comment.comment_view.counts.child_count - childCount} more replies
        </div>
      )}
    </>
  );
}
