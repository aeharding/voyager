import { useContext } from "react";

import { AppContext } from "#/features/auth/AppContext";
import { hidePosts } from "#/features/post/postSlice";
import { useAppDispatch, useAppSelector } from "#/store";

import { FeedContext } from "./FeedContext";

export default function useHidePosts() {
  const dispatch = useAppDispatch();
  const { itemsRefRef } = useContext(FeedContext);
  const { activePageRef } = useContext(AppContext);
  const postReadById = useAppSelector((state) => state.post.postReadById);

  return async function onHide() {
    if (!activePageRef?.current?.current) return;
    if (!("scrollToIndex" in activePageRef.current.current)) return;

    const postIds: number[] | undefined = itemsRefRef?.current?.current?.map(
      (item) => item.post.id,
    );

    if (!postIds) return;

    const toHide = postIds.filter((id) => postReadById[id]);

    await dispatch(hidePosts(toHide));

    activePageRef.current.current.scrollToIndex(0);
  };
}
