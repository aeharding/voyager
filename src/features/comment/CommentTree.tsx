import { CommentNodeI } from "../../helpers/lemmy";
import Comment from "./Comment";
import React, { RefObject, memo, useContext, useMemo } from "react";
import CommentHr from "./CommentHr";
import { useAppDispatch, useAppSelector } from "../../store";
import { updateCommentCollapseState } from "./commentSlice";
import CommentExpander from "./CommentExpander";
import { OTapToCollapseType } from "../../services/db";
import { getOffsetTop, scrollIntoView } from "../../helpers/dom";
import ContinueThread from "./ContinueThread";
import { AppContext, Page } from "../auth/AppContext";

export const MAX_COMMENT_DEPTH = 10;

interface CommentTreeProps {
  comment: CommentNodeI;
  highlightedCommentId?: number;
  first?: boolean;
  fullyCollapsed?: boolean;
  rootIndex: number;
  baseDepth: number;
}

function CommentTree({
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
  const { tapToCollapse } = useAppSelector(
    (state) => state.settings.general.comments,
  );
  const { activePageRef } = useContext(AppContext);

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

export default memo(CommentTree);

export function scrollCommentIntoViewIfNeeded(
  target: EventTarget,
  activePageRef: RefObject<Page | undefined> | undefined,
) {
  if (!(target instanceof HTMLElement)) return;

  const scrollView = target.closest(".virtual-scroller");
  const item = target.closest("ion-item-sliding")?.querySelector("ion-item");

  if (!(scrollView instanceof HTMLElement) || !(item instanceof HTMLElement))
    return;

  const itemScrollOffsetTop = getOffsetTop(item, scrollView);

  if (itemScrollOffsetTop > scrollView.scrollTop) return;

  const page = activePageRef?.current?.current;
  if (page && !("querySelector" in page)) {
    const rootCommentContainer = target.closest("[data-index]");
    if (!(rootCommentContainer instanceof HTMLElement)) return;
    const rootIndex = +rootCommentContainer.getAttribute("data-index")!;
    const itemOffsetRootCommentTop = getOffsetTop(item, rootCommentContainer);

    page.scrollToIndex(rootIndex, {
      smooth: true,
      offset: itemOffsetRootCommentTop,
    });
  } else {
    scrollIntoView(item);
  }
}
