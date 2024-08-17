import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { resolveObject } from "../resolve/resolveSlice";
import Post from "../post/inFeed/Post";
import FeedComment from "../comment/inFeed/FeedComment";
import { styled } from "@linaria/react";
import { InFeedContext } from "../feed/Feed";
import { useDebounceValue } from "usehooks-ts";
import { CenteredSpinner } from "../shared/CenteredSpinner";

const StyledCenteredSpinner = styled(CenteredSpinner)`
  margin-top: 60px;
`;

interface AutoResolvePostCommentProps {
  url: string;
}

export default function AutoResolvePostComment({
  url: userInputUrl,
}: AutoResolvePostCommentProps) {
  const dispatch = useAppDispatch();
  const [url] = useDebounceValue(userInputUrl, 500);
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
  if (!object) return <StyledCenteredSpinner />;

  if (object.post)
    return (
      <InFeedContext.Provider value={true}>
        <Post post={object.post} />
      </InFeedContext.Provider>
    );

  if (object.comment)
    return (
      <InFeedContext.Provider value={true}>
        <FeedComment comment={object.comment} />
      </InFeedContext.Provider>
    );

  return null;
}
