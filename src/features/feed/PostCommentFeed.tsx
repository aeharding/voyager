import { useCallback } from "react";
import Feed, { FeedProps, FetchFn } from "./Feed";
import FeedComment from "../comment/inFeed/FeedComment";
import Post from "../post/inFeed/Post";
import { CommentView, PostView } from "lemmy-js-client";
import { isComment, isPost } from "../../helpers/lemmy";
import { useAppDispatch } from "../../store";
import { css } from "@emotion/react";
import { receivedPosts } from "../post/postSlice";
import { receivedComments } from "../comment/commentSlice";

const itemCss = css`
  border-bottom: 8px solid var(--thick-separator-color);
`;

export type PostCommentItem = PostView | CommentView;

interface PostCommentFeed
  extends Omit<FeedProps<PostCommentItem>, "renderItemContent"> {
  communityName?: string;
}

export default function PostCommentFeed({
  communityName,
  fetchFn: _fetchFn,
  ...rest
}: PostCommentFeed) {
  const dispatch = useAppDispatch();

  const renderItemContent = useCallback(
    (item: PostCommentItem) => {
      if (isPost(item))
        return (
          <Post post={item} communityMode={!!communityName} css={itemCss} />
        );

      return <FeedComment comment={item} css={itemCss} />;
    },
    [communityName]
  );

  const fetchFn: FetchFn<PostCommentItem> = useCallback(
    async (page) => {
      const items = await _fetchFn(page);

      dispatch(receivedPosts(items.filter(isPost)));
      dispatch(receivedComments(items.filter(isComment)));

      return items;
    },
    [_fetchFn, dispatch]
  );

  return (
    <Feed fetchFn={fetchFn} renderItemContent={renderItemContent} {...rest} />
  );
}
