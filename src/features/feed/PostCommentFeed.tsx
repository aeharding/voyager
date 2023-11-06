import {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import Feed, { FeedProps, FetchFn } from "./Feed";
import FeedComment from "../comment/inFeed/FeedComment";
import { CommentView, PostView } from "lemmy-js-client";
import { useAppDispatch, useAppSelector } from "../../store";
import { css } from "@emotion/react";
import {
  postHiddenByIdSelector,
  receivedPosts,
  setPostRead,
} from "../post/postSlice";
import { receivedComments } from "../comment/commentSlice";
import Post from "../post/inFeed/Post";
import CommentHr from "../comment/CommentHr";
import { FeedContext } from "./FeedContext";
import { postHasFilteredKeywords } from "../../helpers/lemmy";

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
  filterKeywords?: boolean;

  /**
   * Feed will auto-hide posts, if enabled by the user
   */
  autoHideIfConfigured?: boolean;

  header?: ReactElement;
}

export default function PostCommentFeed({
  communityName,
  fetchFn: _fetchFn,
  filterHiddenPosts = true,
  filterKeywords = true,
  autoHideIfConfigured,
  filterOnRxFn: _filterOnRxFn,
  filterFn: _filterFn,
  ...rest
}: PostCommentFeed) {
  const dispatch = useAppDispatch();
  const postAppearanceType = useAppSelector(
    (state) => state.settings.appearance.posts.type,
  );
  const postHiddenById = useAppSelector(postHiddenByIdSelector);
  const filteredKeywords = useAppSelector(
    (state) => state.settings.blocks.keywords,
  );

  const disableMarkingRead = useAppSelector(
    (state) => state.settings.general.posts.disableMarkingRead,
  );
  const markReadOnScroll = useAppSelector(
    (state) => state.settings.general.posts.markReadOnScroll,
  );
  const disableAutoHideInCommunities = useAppSelector(
    (state) => state.settings.general.posts.disableAutoHideInCommunities,
  );

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
    [communityName, borderCss],
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
    [postAppearanceType, renderItem],
  );

  const fetchFn: FetchFn<PostCommentItem> = useCallback(
    async (page) => {
      const result = await _fetchFn(page);

      const items = Array.isArray(result) ? result : result.data;

      /* receivedPosts needs to be awaited so that we fetch post metadatas
         from the db before showing them to prevent flickering
      */
      await dispatch(receivedPosts(items.filter(isPost)));
      dispatch(receivedComments(items.filter(isComment)));

      return result;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [_fetchFn, dispatch],
  );

  const filterFn = useCallback(
    (item: PostCommentItem) => {
      const postHidden = postHiddenById[item.post.id];
      if (
        filterHiddenPosts &&
        postHidden &&
        postHidden.immediate &&
        postHidden.hidden
      )
        return false;
      if (
        filterKeywords &&
        postHasFilteredKeywords(
          item.post,
          filterKeywords ? filteredKeywords : [],
        )
      )
        return false;

      if (_filterFn) return _filterFn(item);

      return true;
    },
    [
      postHiddenById,
      filteredKeywords,
      filterKeywords,
      filterHiddenPosts,
      _filterFn,
    ],
  );

  const filterOnRxFn = useCallback(
    (item: PostCommentItem) => {
      const postHidden = postHiddenById[item.post.id];
      if (filterHiddenPosts && postHidden?.hidden) return false;

      if (_filterOnRxFn) return _filterOnRxFn(item);

      return true;
    },
    [filterHiddenPosts, postHiddenById, _filterOnRxFn],
  );

  const getIndex = useCallback(
    (item: PostCommentItem) =>
      "comment" in item ? `comment-${item.comment.id}` : `post-${item.post.id}`,
    [],
  );

  function onRemovedFromTopOfViewport(items: PostCommentItem[]) {
    items.forEach(onAutoRead);
  }

  const shouldAutoHide = (() => {
    if (!autoHideIfConfigured) return false;

    if (communityName) return !disableAutoHideInCommunities;

    return true; // setPostRead doesn't auto-hide if feature is turned completely off
  })();

  function onAutoRead(item: PostCommentItem) {
    if (!isPost(item)) return;

    // Determine if the post is pinned in the current feed
    const postIsPinned =
      (communityName && item.post.featured_community) ||
      (!communityName && item.post.featured_local);

    // Pinned posts should not be automatically hidden
    const shouldAutoHidePost = shouldAutoHide && !postIsPinned;

    dispatch(setPostRead(item.post.id, !shouldAutoHidePost));
  }

  return (
    <Feed
      fetchFn={fetchFn}
      filterFn={filterFn}
      filterOnRxFn={filterOnRxFn}
      getIndex={getIndex}
      renderItemContent={renderItemContent}
      {...rest}
      itemsRef={itemsRef}
      onRemovedFromTop={
        !disableMarkingRead && markReadOnScroll
          ? onRemovedFromTopOfViewport
          : undefined
      }
    />
  );
}
