import { useCallback, useContext, useEffect, useRef } from "react";
import Feed, { FeedProps, FetchFn } from "./Feed";
import FeedComment from "../comment/inFeed/FeedComment";
import { CommentView, PostView } from "lemmy-js-client";
import { useAppDispatch, useAppSelector } from "../../store";
import { css } from "@emotion/react";
import { postHiddenByIdSelector, receivedPosts } from "../post/postSlice";
import { receivedComments } from "../comment/commentSlice";
import Post from "../post/inFeed/Post";
import CommentHr from "../comment/CommentHr";
import { FeedContext } from "./FeedContext";

const thickBorderCss = css`
  border-bottom: 8px solid var(--thick-separator-color);
`;

export type PostCommentItem = PostView | CommentView;

export function isPost(item: PostCommentItem): item is PostView {
  return !isComment(item);
}

export function isComment(item: PostCommentItem): item is CommentView {
  return "comment" in item;
}

interface PostCommentFeed
  extends Omit<FeedProps<PostCommentItem>, "renderItemContent"> {
  communityName?: string;
  filterHiddenPosts?: boolean;
}

export default function PostCommentFeed({
  communityName,
  fetchFn: _fetchFn,
  filterHiddenPosts = true,
  ...rest
}: PostCommentFeed) {
  const dispatch = useAppDispatch();
  const postAppearanceType = useAppSelector(
    (state) => state.settings.appearance.posts.type
  );
  const postHiddenById = useAppSelector(postHiddenByIdSelector);

  const itemsRef = useRef<PostCommentItem[]>();

  const { setItemsRef } = useContext(FeedContext);

  useEffect(() => {
    setItemsRef(itemsRef);

    return () => {
      setItemsRef(undefined);
    };
  }, [setItemsRef]);

  const borderCss = (() => {
    switch (postAppearanceType) {
      case "compact":
        return undefined;
      case "large":
        return thickBorderCss;
    }
  })();

  const renderItem = useCallback(
    (item: PostCommentItem) => {
      if (isPost(item))
        return (
          <Post post={item} communityMode={!!communityName} css={borderCss} />
        );

      return <FeedComment comment={item} css={borderCss} />;
    },
    [communityName, borderCss]
  );

  const renderItemContent = useCallback(
    (item: PostCommentItem) => {
      if (postAppearanceType === "compact")
        return (
          <>
            {renderItem(item)}
            <CommentHr depth={0} />
          </>
        );

      return renderItem(item);
    },
    [postAppearanceType, renderItem]
  );

  const fetchFn: FetchFn<PostCommentItem> = useCallback(
    async (page) => {
      const items = await _fetchFn(page);

      /* receivedPosts needs to be awaited so that we fetch post metadatas
         from the db before showing them to prevent flickering
      */
      await dispatch(receivedPosts(items.filter(isPost)));
      dispatch(receivedComments(items.filter(isComment)));

      return items;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [_fetchFn, dispatch]
  );

  const filterFn = useCallback(
    (item: PostCommentItem) => !postHiddenById[item.post.id],
    [postHiddenById]
  );

  return (
    <Feed
      fetchFn={fetchFn}
      filterFn={filterHiddenPosts ? filterFn : undefined}
      getIndex={(item) =>
        "comment" in item
          ? `comment-${item.comment.id}`
          : `post-${item.post.id}`
      }
      renderItemContent={renderItemContent}
      {...rest}
      itemsRef={itemsRef}
    />
  );
}
