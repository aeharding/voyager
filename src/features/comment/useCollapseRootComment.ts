import { CommentView } from "lemmy-js-client";
import { useCallback, useContext } from "react";
import { toggleCommentCollapseState } from "./commentSlice";
import { useAppDispatch, useAppSelector } from "../../store";
import { AppContext } from "../auth/AppContext";

export default function useCollapseRootComment(
  item: CommentView,
  rootIndex: number | undefined
) {
  const dispatch = useAppDispatch();
  const { activePage } = useContext(AppContext);

  const showCollapsedComment = useAppSelector(
    (state) => state.settings.general.comments.showCollapsedComment
  );

  return useCallback(() => {
    if (!rootIndex) return;

    const rootCommentId = +item.comment.path.split(".")[1];
    if (
      !showCollapsedComment ||
      item.comment.id !== rootCommentId ||
      item.counts.child_count
    ) {
      dispatch(toggleCommentCollapseState(rootCommentId));
    }

    const currentActivePage = activePage?.current;
    if (!currentActivePage || !("scrollToIndex" in currentActivePage)) return;

    currentActivePage.scrollToIndex({
      index: rootIndex,
      behavior: "smooth",
    });
  }, [
    activePage,
    dispatch,
    item.comment,
    item.counts.child_count,
    rootIndex,
    showCollapsedComment,
  ]);
}
