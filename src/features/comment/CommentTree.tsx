import { CommentNodeI } from "../../helpers/lemmy";
import Comment from "./Comment";
import React, { useMemo } from "react";
import CommentHr from "./CommentHr";
import { useAppDispatch, useAppSelector } from "../../store";
import { updateCommentCollapseState } from "./commentSlice";
import { Person } from "lemmy-js-client";
import CommentExpander from "./CommentExpander";
import { OTapToCollapseType } from "../../services/db";
import { getOffsetTop, scrollIntoView } from "../../helpers/dom";
import ContinueThread from "./ContinueThread";

export const MAX_COMMENT_DEPTH = 10;

interface CommentTreeProps {
  comment: CommentNodeI;
  highlightedCommentId?: number;
  first?: boolean;
  op: Person;
  fullyCollapsed?: boolean;
  rootIndex: number;
  baseDepth: number;
}

export default function CommentTree({
  comment,
  highlightedCommentId,
  first,
  op,
  fullyCollapsed,
  rootIndex,
  baseDepth,
}: CommentTreeProps) {
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector(
    (state) =>
      state.comment.commentCollapsedById[comment.comment_view.comment.id],
  );
  const { tapToCollapse } = useAppSelector(
    (state) => state.settings.general.comments,
  );

  // Comment context chains don't show missing for parents
  const showMissing = useMemo(() => {
    if (!highlightedCommentId) return true;

    if (
      comment.comment_view.comment.path
        .split(".")
        .includes(`${highlightedCommentId}`)
    )
      return true;

    return false;
  }, [comment.comment_view.comment.path, highlightedCommentId]);

  function setCollapsed(collapsed: boolean) {
    dispatch(
      updateCommentCollapseState({
        commentId: comment.comment_view.comment.id,
        collapsed,
      }),
    );
  }

  if (
    comment.absoluteDepth - baseDepth > MAX_COMMENT_DEPTH &&
    comment.comment_view.counts.child_count >= 2
  ) {
    return (
      <ContinueThread
        depth={comment.absoluteDepth - baseDepth}
        absoluteDepth={comment.absoluteDepth}
        key={comment.comment_view.comment.id}
        collapsed={collapsed || fullyCollapsed}
        comment={comment}
      />
    );
  }

  // eslint-disable-next-line no-sparse-arrays
  const payload = [
    <React.Fragment key={comment.comment_view.comment.id}>
      {!first && (
        <CommentHr
          depth={
            !comment.absoluteDepth
              ? 0
              : Math.max(1, comment.absoluteDepth - baseDepth)
          }
        />
      )}
      <Comment
        comment={comment.comment_view}
        highlightedCommentId={highlightedCommentId}
        depth={comment.absoluteDepth - baseDepth}
        absoluteDepth={comment.absoluteDepth}
        onClick={(e) => {
          if (
            tapToCollapse === OTapToCollapseType.Neither ||
            tapToCollapse === OTapToCollapseType.OnlyHeaders
          )
            return;

          setCollapsed(!collapsed);

          scrollViewUpIfNeeded(e.target);
        }}
        collapsed={collapsed}
        fullyCollapsed={!!fullyCollapsed}
        rootIndex={rootIndex}
      />
    </React.Fragment>,
    ...comment.children.map((comment) => (
      <CommentTree
        key={comment.comment_view.comment.id}
        highlightedCommentId={highlightedCommentId}
        comment={comment}
        op={op}
        fullyCollapsed={collapsed || fullyCollapsed}
        rootIndex={rootIndex}
        baseDepth={baseDepth}
      />
    )),
  ];

  if (showMissing && comment.missing && comment.missing > 0) {
    payload.push(
      <CommentExpander
        key={`${comment.comment_view.comment.id}--expand`}
        comment={comment.comment_view}
        depth={comment.absoluteDepth - baseDepth}
        absoluteDepth={comment.absoluteDepth}
        missing={comment.missing}
        collapsed={collapsed || fullyCollapsed}
      />,
    );
  }

  return payload;
}

export function scrollViewUpIfNeeded(target: EventTarget) {
  if (!(target instanceof HTMLElement)) return;

  const scrollView = target.closest(".virtual-scroller");
  const item = target.closest("ion-item-sliding")?.querySelector("ion-item");

  if (!(scrollView instanceof HTMLElement) || !(item instanceof HTMLElement))
    return;

  const itemOffsetTop = getOffsetTop(item, scrollView);

  if (itemOffsetTop > scrollView.scrollTop) return;

  scrollIntoView(item);
}
