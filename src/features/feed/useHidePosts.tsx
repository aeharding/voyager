import { useCallback, useContext } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { FeedContext } from "./FeedContext";
import { AppContext } from "../auth/AppContext";
import { hidePosts } from "../post/postSlice";

export default function useHidePosts() {
  const dispatch = useAppDispatch();
  const { itemsRef } = useContext(FeedContext);
  const { activePage } = useContext(AppContext);
  const postReadById = useAppSelector((state) => state.post.postReadById);

  const onHide = useCallback(async () => {
    if (!activePage?.current) return;
    if ("querySelector" in activePage.current) return;

    const postIds: number[] | undefined = itemsRef?.current?.map(
      (item) => item.post.id
    );

    if (!postIds) return;

    const toHide = postIds.filter((id) => postReadById[id]);

    await dispatch(hidePosts(toHide));

    activePage.current.scrollToIndex({ index: 0, behavior: "auto" });
  }, [activePage, dispatch, itemsRef, postReadById]);

  return onHide;
}
