import { useDebouncedValue } from "@mantine/hooks";
import { useEffect, useState } from "react";

import FeedComment from "#/features/comment/inFeed/FeedComment";
import { InFeedContext } from "#/features/feed/Feed";
import Post from "#/features/post/inFeed/Post";
import { resolveObject } from "#/features/resolve/resolveSlice";
import { CenteredSpinner } from "#/features/shared/CenteredSpinner";
import { useAppDispatch, useAppSelector } from "#/store";

import styles from "./AutoResolvePostComment.module.css";

interface AutoResolvePostCommentProps {
  url: string;
}

export default function AutoResolvePostComment({
  url: userInputUrl,
}: AutoResolvePostCommentProps) {
  const dispatch = useAppDispatch();
  const [url] = useDebouncedValue(userInputUrl, 500);
  const object = useAppSelector((state) => state.resolve.objectByUrl[url]);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      const _url = url;
      setError(false);

      try {
        await dispatch(resolveObject(url));
      } catch (error) {
        if (_url === url) setError(true);
        throw error;
      }

      if (_url === url) setError(false);
    })();
  }, [url, dispatch]);

  if (object === "couldnt_find_object" || error) return null;
  if (!object) return <CenteredSpinner className={styles.spinner} />;

  if (object.post)
    return (
      <InFeedContext value={true}>
        <Post post={object.post} />
      </InFeedContext>
    );

  if (object.comment)
    return (
      <InFeedContext value={true}>
        <FeedComment comment={object.comment} />
      </InFeedContext>
    );

  return null;
}
