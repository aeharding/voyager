import { CommentView } from "lemmy-js-client";
import { useCallback, useContext } from "react";
import { toggleCommentCollapseState } from "./commentSlice";
import { useAppDispatch } from "../../store";
import { AppContext } from "../auth/AppContext";

export default function useCollapseRootComment(
  item: CommentView | undefined,
  rootIndex: number | undefined
) {
  const dispatch = useAppDispatch();
  const { activePage } = useContext(AppContext);

  return useCallback(() => {
    if (!item || !rootIndex) return;

    const rootCommentId = +item.comment.path.split(".")[1];

    dispatch(toggleCommentCollapseState(rootCommentId));

    const currentActivePage = activePage?.current;
    if (!currentActivePage || !("scrollToIndex" in currentActivePage)) return;

    currentActivePage.scrollToIndex({
      index: rootIndex,
      behavior: "smooth",
    });
  }, [activePage, dispatch, item, rootIndex]);
}
