import { CommentView } from "lemmy-js-client";
import { useCallback, useContext } from "react";
import { toggleCommentCollapseState } from "./commentSlice";
import { useAppDispatch } from "../../store";
import { AppContext } from "../auth/AppContext";

export default function useCollapseRootComment(
  item: CommentView,
  rootIndex: number | undefined
) {
  const dispatch = useAppDispatch();
  const { activePage } = useContext(AppContext);

  return useCallback(() => {
    if (!rootIndex) return;

    const rootCommentId = +item.comment.path.split(".")[1];

    dispatch(toggleCommentCollapseState(rootCommentId));

    if (!activePage || !("current" in activePage)) return;

    activePage.current?.scrollToIndex({
      index: rootIndex,
      behavior: "smooth",
    });
  }, [activePage, dispatch, item.comment.path, rootIndex]);
}
