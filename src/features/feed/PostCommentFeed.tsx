import { CommentView, PostView } from "lemmy-js-client";
import {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";

import { receivedComments } from "#/features/comment/commentSlice";
import FeedComment from "#/features/comment/inFeed/FeedComment";
import CommentHr from "#/features/comment/inTree/CommentHr";
import Post from "#/features/post/inFeed/Post";
import {
  postHiddenByIdSelector,
  receivedPosts,
  setPostRead,
} from "#/features/post/postSlice";
import {
  isComment,
  isPost,
  postHasFilteredKeywords,
  postHasFilteredWebsite,
} from "#/helpers/lemmy";
import { useAppDispatch, useAppSelector } from "#/store";

import Feed, { FeedProps, FetchFn } from "./Feed";
import { FeedContext } from "./FeedContext";
import { useAutohidePostIfNeeded } from "./PageTypeContext";

import styles from "./PostCommentFeed.module.css";

export type PostCommentItem = PostView | CommentView;

interface PostCommentFeed
  extends Omit<FeedProps<PostCommentItem>, "renderItemContent"> {
  communityName?: string;
  filterHiddenPosts?: boolean;
  filterKeywordsAndWebsites?: boolean;

  header?: ReactElement;
}

export default function PostCommentFeed({
  fetchFn: _fetchFn,
  filterHiddenPosts = true,
  filterKeywordsAndWebsites = true,
  filterOnRxFn: _filterOnRxFn,
  filterFn: _filterFn,
  ...rest
}: PostCommentFeed) {
  const dispatch = useAppDispatch();
  const postAppearanceType = useAppSelector(
    (state) => state.settings.appearance.posts.type,
  );
  const postHiddenById = useAppSelector(postHiddenByIdSelector);
  const postDeletedById = useAppSelector((state) => state.post.postDeletedById);
  const filteredKeywords = useAppSelector(
    (state) => state.settings.blocks.keywords,
  );
  const filteredWebsites = useAppSelector(
    (state) => state.settings.blocks.websites,
  );

  const disableMarkingRead = useAppSelector(
    (state) => state.settings.general.posts.disableMarkingRead,
  );
  const markReadOnScroll = useAppSelector(
    (state) => state.settings.general.posts.markReadOnScroll,
  );
  const neverShowReadPosts = useAppSelector(
    (state) => state.settings.general.posts.neverShowReadPosts,
  );
  const autohidePostIfNeeded = useAutohidePostIfNeeded();

  const itemsRef = useRef<PostCommentItem[]>(undefined);

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
        return styles.thickBottomBorder;
    }
  })();

  const renderItem = useCallback(
    (item: PostCommentItem) => {
      if (isPost(item)) return <Post post={item} className={borderCss} />;

      return <FeedComment comment={item} className={borderCss} />;
    },
    [borderCss],
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
    async (page, signal) => {
      const result = await _fetchFn(page, signal);

      const items = Array.isArray(result) ? result : result.data;

      /* receivedPosts needs to be awaited so that we fetch post metadatas
         from the db before showing them to prevent flickering
      */
      await dispatch(receivedPosts(items.filter(isPost)));
      dispatch(receivedComments(items.filter(isComment)));

      return result;
    },
    [_fetchFn, dispatch],
  );

  const filterFn = useCallback(
    (item: PostCommentItem) => {
      // Filter deleted posts when:
      // 1. Via Lemmy API, mods see deleted posts in feed. Filter them out.
      // 2. User deletes their own post (live update to remove from feed)
      if (isPost(item)) {
        if (item.post.deleted || postDeletedById[item.post.id]) {
          return false;
        }
      } else {
        if (item.comment.deleted) {
          return false;
        }
      }

      const postHidden = postHiddenById[item.post.id];
      if (
        filterHiddenPosts &&
        postHidden &&
        postHidden.immediate &&
        postHidden.hidden
      )
        return false;

      if (filterKeywordsAndWebsites) {
        if (postHasFilteredKeywords(item.post, filteredKeywords)) return false;
        if (postHasFilteredWebsite(item.post, filteredWebsites)) return false;
      }

      if (_filterFn) return _filterFn(item);

      return true;
    },
    [
      postHiddenById,
      filterHiddenPosts,
      filterKeywordsAndWebsites,
      _filterFn,
      postDeletedById,
      filteredKeywords,
      filteredWebsites,
    ],
  );

  const filterOnRxFn = useCallback(
    (item: PostCommentItem) => {
      const postHidden = postHiddenById[item.post.id];
      if (isPost(item)) {
        if (filterHiddenPosts && postHidden?.hidden) return false;

        // Ignore neverShowReadPosts on hidden posts page (and profile, etc)
        if (filterHiddenPosts && neverShowReadPosts && item.read) return false;

        // Filter removed from community/special feed pages for mods
        if (filterHiddenPosts && item.post.removed) {
          return false;
        }
      }

      if (_filterOnRxFn) return _filterOnRxFn(item);

      return true;
    },
    [filterHiddenPosts, postHiddenById, _filterOnRxFn, neverShowReadPosts],
  );

  const getIndex = useCallback(
    (item: PostCommentItem) =>
      "comment" in item ? `comment-${item.comment.id}` : `post-${item.post.id}`,
    [],
  );

  function onRemovedFromTopOfViewport(items: PostCommentItem[]) {
    items.forEach(onAutoRead);
  }

  function onAutoRead(item: PostCommentItem) {
    if (!isPost(item)) return;

    dispatch(setPostRead(item.post.id));
    autohidePostIfNeeded(item, "scroll");
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
