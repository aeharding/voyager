import React, { RefObject, useContext } from "react";

import { AppContext, Page } from "#/features/auth/AppContext";
import { getOffsetTop, scrollIntoView } from "#/helpers/dom";
import { CommentNodeI } from "#/helpers/lemmy";
import { OTapToCollapseType } from "#/services/db";
import { useAppDispatch, useAppSelector } from "#/store";

import { toggleCommentCollapseState } from "../commentSlice";
import CommentExpander from "./CommentExpander";
import CommentHr from "./CommentHr";
import ContinueThread from "./ContinueThread";
import FullyCollapsibleComment from "./FullyCollapsibleComment";

export const MAX_COMMENT_DEPTH = 10;

interface CommentTreeProps {
  comment: CommentNodeI;
  highlightedCommentId?: number;
  first?: boolean;
  fullyCollapsed?: boolean;
  rootIndex: number;
  baseDepth: number;
}

export default function CommentTree({
  comment,
  highlightedCommentId,
  first,
  fullyCollapsed,
  rootIndex,
  baseDepth,
}: CommentTreeProps) {
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector(
    (state) =>
      state.comment.commentCollapsedById[comment.comment_view.comment.id],
  );
  const tapToCollapse = useAppSelector(
    (state) => state.settings.general.comments.tapToCollapse,
  );
  const { activePageRef } = useContext(AppContext);

  // Comment context chains don't show missing for parents
  const showMissing = (() => {
    if (!highlightedCommentId) return true;

    if (
      comment.comment_view.comment.path
        .split(".")
        .includes(`${highlightedCommentId}`)
    )
      return true;

    return false;
  })();

  function toggleCollapsed() {
    dispatch(toggleCommentCollapseState(comment.comment_view.comment.id));
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
      <FullyCollapsibleComment
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

          toggleCollapsed();

          scrollCommentIntoViewIfNeeded(e.target, activePageRef);
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

export function scrollCommentIntoViewIfNeeded(
  target: EventTarget,
  activePageRef: RefObject<Page | undefined> | undefined,
) {
  if (!(target instanceof HTMLElement)) return;

  const scrollView = target.closest(".virtual-scroller");

  // get `<ion-item>` from `target`
  const item = target.closest("ion-item-sliding")?.querySelector("ion-item");

  if (!(scrollView instanceof HTMLElement) || !(item instanceof HTMLElement))
    return;

  // if top edge of comment is in view, return
  const itemScrollOffsetTop = getOffsetTop(item, scrollView);
  if (itemScrollOffsetTop > scrollView.scrollTop) return;

  const page = activePageRef?.current?.current;
  if (page && !("querySelector" in page)) {
    // if virtual scrolling, use virtual scroll API

    // get root comment index
    const rootCommentContainer = target.closest("[data-index]");
    if (!(rootCommentContainer instanceof HTMLElement)) return;
    const rootIndex = +rootCommentContainer.getAttribute("data-index")!;

    // get comment's vertical offset from root comment
    const itemOffsetRootCommentTop = getOffsetTop(item, rootCommentContainer);

    page.scrollToIndex(rootIndex, {
      smooth: true,
      offset: itemOffsetRootCommentTop,
    });
  } else {
    // if not virtual scrolling, use typical scrollIntoView
    scrollIntoView(item);
  }
}
