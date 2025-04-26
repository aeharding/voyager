import { CommentView } from "lemmy-js-client";

import { useAppPageVListHandleRef } from "#/helpers/AppPage";
import { useAppDispatch } from "#/store";

import { toggleCommentCollapseState } from "../commentSlice";

export default function useCollapseRootComment(
  item: CommentView | undefined,
  rootIndex: number | undefined,
) {
  const dispatch = useAppDispatch();
  const virtuaHandleRef = useAppPageVListHandleRef();

  return function collapseRootComment() {
    if (!item || !rootIndex) return;

    const rootCommentId = +item.comment.path.split(".")[1]!;

    dispatch(toggleCommentCollapseState(rootCommentId));

    const currentActivePage = virtuaHandleRef?.current;
    if (!currentActivePage) return;

    currentActivePage.scrollToIndex(rootIndex, {
      smooth: true,
    });
  };
}
