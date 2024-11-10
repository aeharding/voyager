import { CommentView } from "lemmy-js-client";
import { useContext } from "react";

import { AppContext } from "#/features/auth/AppContext";
import { useAppDispatch } from "#/store";

import { toggleCommentCollapseState } from "../commentSlice";

export default function useCollapseRootComment(
  item: CommentView | undefined,
  rootIndex: number | undefined,
) {
  const dispatch = useAppDispatch();
  const { activePageRef } = useContext(AppContext);

  return function collapseRootComment() {
    if (!item || !rootIndex) return;

    const rootCommentId = +item.comment.path.split(".")[1]!;

    dispatch(toggleCommentCollapseState(rootCommentId));

    const currentActivePage = activePageRef?.current?.current;
    if (!currentActivePage || !("scrollToIndex" in currentActivePage)) return;

    currentActivePage.scrollToIndex(rootIndex, {
      smooth: true,
    });
  };
}
