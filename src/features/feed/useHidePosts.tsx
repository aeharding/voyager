import { use } from "react";

import { hidePosts } from "#/features/post/postSlice";
import { useAppPageVListHandleRef } from "#/helpers/AppPage";
import { useAppDispatch, useAppSelector } from "#/store";

import { FeedContext } from "./FeedContext";

export default function useHidePosts() {
  const dispatch = useAppDispatch();
  const { itemsRefRef } = use(FeedContext);
  const virtuaHandleRef = useAppPageVListHandleRef();
  const postReadById = useAppSelector((state) => state.post.postReadById);

  return async function onHide() {
    if (!virtuaHandleRef?.current) return;

    const postIds: number[] | undefined = itemsRefRef?.current?.current?.map(
      (item) => item.post.id,
    );

    if (!postIds) return;

    const toHide = postIds.filter((id) => postReadById[id]);

    await dispatch(hidePosts(toHide));

    virtuaHandleRef.current.scrollToIndex(0);
  };
}
