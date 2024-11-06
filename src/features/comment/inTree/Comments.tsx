import { RefresherCustomEvent } from "@ionic/core";
import { IonRefresher, IonRefresherContent, IonSpinner } from "@ionic/react";
import { styled } from "@linaria/react";
import { CommentSortType, CommentView } from "lemmy-js-client";
import * as _ from "radashi";
import React, {
  useCallback,
  useEffect,
  experimental_useEffectEvent as useEffectEvent,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { VList, VListHandle } from "virtua";

import { useSetActivePage } from "#/features/auth/AppContext";
import FeedLoadMoreFailed from "#/features/feed/endItems/FeedLoadMoreFailed";
import { getPost } from "#/features/post/postSlice";
import { defaultCommentDepthSelector } from "#/features/settings/settingsSlice";
import { scrollIntoView, useScrollIntoViewWorkaround } from "#/helpers/dom";
import {
  buildCommentsTreeWithMissing,
  getDepthFromCommentPath,
} from "#/helpers/lemmy";
import useAppToast from "#/helpers/useAppToast";
import useClient from "#/helpers/useClient";
import usePreservePositionFromBottomInScrollView from "#/helpers/usePreservePositionFromBottomInScrollView";
import { IndexedVirtuaItem } from "#/helpers/virtua";
import { postDetailPageHasVirtualScrollEnabled } from "#/routes/pages/posts/PostPage";
import { isSafariFeedHackEnabled } from "#/routes/pages/shared/FeedContent";
import { useAppDispatch, useAppSelector } from "#/store";

import { receivedComments } from "../commentSlice";
import CommentTree, { MAX_COMMENT_DEPTH } from "./CommentTree";
import { CommentsContext } from "./CommentsContext";
import LoadParentComments from "./LoadParentComments";

const ScrollViewContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const centerCss = `
  position: relative;
  padding: 4rem 0 4rem;
  left: 50%;
  transform: translateX(-50%);
`;

const StyledIonSpinner = styled(IonSpinner)`
  ${centerCss}
  opacity: 0.7;
`;

const Empty = styled.div`
  ${centerCss}

  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: center;

  aside {
    color: var(--ion-color-medium);
    font-size: 0.8em;
  }
`;

const MAX_COMMENT_PATH_CONTEXT_DEPTH = 2;

export type CommentsHandle = {
  appendComments: (comments: CommentView[]) => void;
  prependComments: (comments: CommentView[]) => void;
};

interface CommentsProps {
  header: React.ReactNode;
  postId: number;
  commentPath?: string;
  threadCommentId?: string;
  sort: CommentSortType;
  bottomPadding?: number;

  ref: React.RefObject<CommentsHandle>;
}

export default function Comments({
  header,
  postId,
  commentPath,
  sort,
  bottomPadding,
  threadCommentId,
  ref,
}: CommentsProps) {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(0);
  const [loading, _setLoading] = useState(true);
  const loadingRef = useRef(false);
  const finishedPagingRef = useRef(false);
  const [comments, setComments] = useState<CommentView[]>([]);

  const [loadFailed, setLoadFailed] = useState(false);

  const client = useClient();
  const [isListAtTop, setIsListAtTop] = useState<boolean>(true);
  const presentToast = useAppToast();
  const defaultCommentDepth = useAppSelector(defaultCommentDepthSelector);

  const scrollViewContainerRef = useRef<HTMLDivElement>(null);
  const virtuaRef = useRef<VListHandle>(null);

  const virtualEnabled = postDetailPageHasVirtualScrollEnabled(
    commentPath,
    threadCommentId,
  );

  const preservePositionFromBottomInScrollView =
    usePreservePositionFromBottomInScrollView(
      scrollViewContainerRef,
      !virtualEnabled,
    );

  function setLoading(loading: boolean) {
    _setLoading(loading);
    loadingRef.current = loading;
  }

  useSetActivePage(virtuaRef, virtualEnabled);

  const [maxContext, setMaxContext] = useState(
    getCommentContextDepthForPath(commentPath),
  );

  useEffect(() => {
    setMaxContext(getCommentContextDepthForPath(commentPath));
  }, [commentPath]);

  const parentCommentId = (() => {
    if (commentPath) return +commentPath.split(".")[1]!;
    if (threadCommentId) return +threadCommentId;
    return undefined;
  })();

  const highlightedCommentId = (() => {
    if (commentPath) return +commentPath.split(".").pop()!;
    if (threadCommentId) return +threadCommentId;
    return undefined;
  })();

  const maxDepth = (() => {
    // Viewing a single thread should always show highlighted comment, regardless of depth
    if (commentPath) {
      return getDepthFromCommentPath(commentPath) + MAX_COMMENT_DEPTH + 1;
    }

    if (threadCommentId) return MAX_COMMENT_DEPTH + 1;

    return defaultCommentDepth;
  })();

  const filteredComments = useMemo(() => {
    let potentialComments = comments;

    // Filter context to a single comment chain (only show direct ancestors and children)
    if (commentPath) {
      potentialComments = potentialComments.filter((c) => {
        if (
          commentPath.split(".").includes(`${c.comment.id}`) &&
          getDepthFromCommentPath(c.comment.path) >= maxContext
        )
          return true;
        if (
          highlightedCommentId &&
          c.comment.path.split(".").includes(`${highlightedCommentId}`)
        )
          return true;
        return false;
      });
    } else if (threadCommentId) {
      // Filter with commentId as root comment (we're viewing a continuing thread)
      potentialComments = potentialComments.filter((c) =>
        c.comment.path.split(".").includes(threadCommentId),
      );
    }

    // Comment depths for filtered results can be out of order,
    // so they need to be sorted before building the tree.
    //
    // This is probably a bit inefficient (we could probably check
    // for root comment to pass to the tree builder instead of the
    // tree builder assuming the first comment is the root comment),
    // but since we're only viewing a single thread
    // (and have already filtered) it probably doesn't matter much
    if (commentPath || threadCommentId) {
      potentialComments = _.sort(potentialComments, (i) =>
        getDepthFromCommentPath(i.comment.path),
      );
    }

    return potentialComments;
  }, [
    commentPath,
    comments,
    highlightedCommentId,
    maxContext,
    threadCommentId,
  ]);

  const focusCommentIfNeeded = useCallback(() => {
    if (!bottomPadding) return false;

    const commentElement = scrollViewContainerRef.current?.querySelector(
      `.comment-${highlightedCommentId}`,
    );

    setTimeout(
      () => {
        if (!(commentElement instanceof HTMLElement)) return;

        scrollIntoView(commentElement, bottomPadding);
      },
      useScrollIntoViewWorkaround ? 200 : 600,
    );

    return !!commentElement;
  }, [highlightedCommentId, bottomPadding]);

  // This is super hacky logic to scroll the view received new comments
  const scrolledRef = useRef(false);
  useEffect(() => {
    if (scrolledRef.current) return;
    if (focusCommentIfNeeded()) scrolledRef.current = true;
  }, [filteredComments, focusCommentIfNeeded]);

  const commentTree = useMemo(() => {
    return filteredComments.length
      ? buildCommentsTreeWithMissing(
          filteredComments,
          !!commentPath || !!threadCommentId,
        )
      : [];
  }, [commentPath, filteredComments, threadCommentId]);

  const fetchComments = useCallback(
    async (refresh = false) => {
      if (refresh) {
        if (page === 0 && loadingRef.current) return; // Still loading first page
        finishedPagingRef.current = false;
      } else {
        if (loadingRef.current) return;
        if (finishedPagingRef.current) return;
      }

      let response;

      const currentPage = refresh ? 1 : page + 1;

      const reqPostId = postId;
      const reqCommentId = parentCommentId;
      setLoading(true);

      try {
        response = await client.getComments({
          post_id: reqPostId,
          parent_id: parentCommentId,
          limit: 10,
          sort: sort,
          type_: "All",

          max_depth: maxDepth,

          saved_only: false,
          page: currentPage,
        });
      } catch (error) {
        if (reqPostId === postId && reqCommentId === parentCommentId)
          presentToast({
            message: "Problem fetching comments. Please try again.",
            color: "danger",
          });

        setLoadFailed(true);
        if (refresh) {
          setComments([]);
          setPage(0);
        }

        throw error;
      } finally {
        setLoading(false);
      }

      dispatch(receivedComments(response.comments));

      if (reqPostId !== postId || reqCommentId !== parentCommentId) return;

      const existingComments = refresh ? [] : comments;
      const newComments = _.diff(
        response.comments,
        existingComments,
        (c) => c.comment.id,
      );
      if (!newComments.length) finishedPagingRef.current = true;

      const potentialComments = _.unique(
        [...existingComments, ...newComments],
        (c) => c.comment.id,
      );

      setComments(potentialComments);
      setPage(currentPage);
      setLoadFailed(false);

      if (refresh) scrolledRef.current = false;
    },
    [
      client,
      comments,
      dispatch,
      maxDepth,
      page,
      parentCommentId,
      postId,
      presentToast,
      sort,
    ],
  );

  const fetchCommentsEvent = useEffectEvent(fetchComments);

  useEffect(() => {
    fetchCommentsEvent(true);
  }, [sort, commentPath, postId, client, threadCommentId]);

  const prependComments = useCallback(
    async (comments: CommentView[]) => {
      setComments((existingComments) => {
        let commentsResult;

        // We want to *unshift* comments, so that they appear as first child(ren) of a given node

        // if `commentPath` exists, we call `buildCommentsTree` with `true`
        if (commentPath || threadCommentId) {
          // The first comment is considered the root (see `buildCommentsTree(comments, true)`),
          // so have to insert at root + 1 instead of at beginning
          commentsResult = existingComments.slice(); // don't mutate existing
          commentsResult.splice(1, 0, ...comments); // insert after root
        } else {
          // doesn't matter where inserted into array, put them first
          commentsResult = [...comments, ...existingComments];
        }

        const newComments = _.unique(commentsResult, (c) => c.comment.id);

        // Increase the child_count as appropriate
        comments.forEach((c) => {
          if (existingComments.some((d) => d.comment.id === c.comment.id))
            return;

          const parentIndex = newComments.findIndex((d) => {
            const path = c.comment.path.split(".");
            return d.comment.id === +(path[path.length - 2] ?? -1);
          });
          const parent = newComments[parentIndex];
          if (parent) {
            newComments.splice(parentIndex, 1, {
              ...parent,
              counts: {
                ...parent.counts,
                child_count: parent.counts.child_count + 1,
              },
            });
          }
        });

        return newComments;
      });
    },
    [commentPath, threadCommentId],
  );

  const getComments = useCallback(() => comments, [comments]);

  const appendComments = useCallback((comments: CommentView[]) => {
    setComments((existingComments) =>
      _.unique([...existingComments, ...comments], (c) => c.comment.id),
    );
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      appendComments,
      prependComments,
    }),
    [appendComments, prependComments],
  );

  async function handleRefresh(event: RefresherCustomEvent) {
    try {
      await Promise.all([fetchComments(true), dispatch(getPost(postId))]);
    } finally {
      event.detail.complete();
    }
  }

  const allComments = useMemo(() => {
    const tree = commentTree.map((comment, index) => (
      <CommentTree
        comment={comment}
        highlightedCommentId={highlightedCommentId}
        key={comment.comment_view.comment.id}
        first={index === 0}
        rootIndex={index + 1} /* Plus header index = 0 */
        baseDepth={
          commentPath
            ? Math.max(0, getDepthFromCommentPath(commentPath) - 2)
            : comment.absoluteDepth
        }
      />
    ));

    if (tree.length && maxContext > 0)
      tree.unshift(
        <LoadParentComments
          key="load-parent-comments"
          setMaxContext={(maxContext) => {
            preservePositionFromBottomInScrollView.save();
            setMaxContext(maxContext);
          }}
        />,
      );

    return tree;
  }, [
    commentTree,
    highlightedCommentId,
    commentPath,
    maxContext,
    preservePositionFromBottomInScrollView,
  ]);

  const renderFooter = useCallback(() => {
    if (loadFailed)
      return (
        <FeedLoadMoreFailed
          fetchMore={fetchComments}
          loading={loading}
          pluralType="comments"
        />
      );

    if (loading && !comments.length) return <StyledIonSpinner />;

    if (!comments.length)
      return (
        <Empty>
          <div>No Comments</div>
          <aside>It&apos;s quiet... too quiet...</aside>
        </Empty>
      );
  }, [comments.length, fetchComments, loadFailed, loading]);

  const commentsContextValue = useMemo(
    () => ({
      refresh: () => fetchComments(true),
      appendComments,
      prependComments,
      getComments,
    }),
    [appendComments, prependComments, getComments, fetchComments],
  );

  useEffect(() => {
    preservePositionFromBottomInScrollView.restore();
  }, [maxContext, preservePositionFromBottomInScrollView]);

  const content = useMemo(
    () =>
      _.sift([
        header,
        ...allComments,
        renderFooter(),
        bottomPadding ? (
          <div style={{ height: `${bottomPadding}px` }} />
        ) : undefined,
      ]),
    [allComments, bottomPadding, header, renderFooter],
  );

  return (
    <CommentsContext.Provider value={commentsContextValue}>
      <IonRefresher
        slot="fixed"
        onIonRefresh={handleRefresh}
        disabled={isSafariFeedHackEnabled && !isListAtTop}
      >
        <IonRefresherContent />
      </IonRefresher>
      <ScrollViewContainer ref={scrollViewContainerRef}>
        {virtualEnabled ? (
          <VList
            className={
              isSafariFeedHackEnabled
                ? "virtual-scroller"
                : "ion-content-scroll-host virtual-scroller"
            }
            ref={virtuaRef}
            style={{ height: "100%" }}
            // @ts-expect-error Virtua types not updated for forwardRef-less components
            item={IndexedVirtuaItem}
            overscan={1}
            onRangeChange={(start, end) => {
              if (end + 10 > allComments.length && !loadFailed) {
                fetchComments();
              }
            }}
            onScroll={(offset) => {
              setIsListAtTop(offset < 6);
            }}
          >
            {...content}
          </VList>
        ) : (
          <>{...content}</>
        )}
      </ScrollViewContainer>
    </CommentsContext.Provider>
  );
}

function getCommentContextDepthForPath(
  commentPath: string | undefined,
): number {
  return commentPath
    ? getDepthFromCommentPath(commentPath) - MAX_COMMENT_PATH_CONTEXT_DEPTH
    : 0;
}
