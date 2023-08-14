import { useCallback, useContext } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { FeedContext } from "./FeedContext";
import { AppContext } from "../auth/AppContext";
import { hidePosts } from "../post/postSlice";

export default function useHidePosts() {
  const dispatch = useAppDispatch();
  const { itemsRefRef } = useContext(FeedContext);
  const { activePageRef } = useContext(AppContext);
  const postReadById = useAppSelector((state) => state.post.postReadById);

  const onHide = useCallback(async () => {
    if (!activePageRef?.current?.current) return;
    if (!("scrollToIndex" in activePageRef.current.current)) return;

    const postIds: number[] | undefined = itemsRefRef?.current?.current?.map(
      (item) => item.post.id,
    );

    if (!postIds) return;

    const toHide = postIds.filter((id) => postReadById[id]);

    await dispatch(hidePosts(toHide));

    activePageRef.current.current.scrollToIndex({ index: 0, behavior: "auto" });
  }, [activePageRef, dispatch, itemsRefRef, postReadById]);

  return onHide;
}
