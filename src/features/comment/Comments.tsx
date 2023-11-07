import React, {
  Fragment,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  MAX_DEFAULT_COMMENT_DEPTH,
  buildCommentsTreeWithMissing,
} from "../../helpers/lemmy";
import CommentTree, { MAX_COMMENT_DEPTH } from "./CommentTree";
import { IonRefresher, IonRefresherContent, IonSpinner } from "@ionic/react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { CommentSortType, CommentView, Person } from "lemmy-js-client";
import { pullAllBy, uniqBy } from "lodash";
import { useAppDispatch, useAppSelector } from "../../store";
import { receivedComments } from "./commentSlice";
import { RefresherCustomEvent } from "@ionic/core";
import { getPost } from "../post/postSlice";
import useClient from "../../helpers/useClient";
import { useSetActivePage } from "../auth/AppContext";
import { CommentsContext } from "./CommentsContext";
import { defaultCommentDepthSelector } from "../settings/settingsSlice";
import { isSafariFeedHackEnabled } from "../../pages/shared/FeedContent";
import useAppToast from "../../helpers/useAppToast";
import { VList, VListHandle } from "virtua";
import LoadParentComments from "./LoadParentComments";

const centerCss = css`
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

const MAX_COMMENT_PATH_CONTEXT_DEPTH = 3;

export type CommentsHandle = {
  appendComments: (comments: CommentView[]) => void;
  prependComments: (comments: CommentView[]) => void;
};

interface CommentsProps {
  header: React.ReactNode;
  postId: number;
  commentPath?: string;
  threadCommentId?: string;
  op: Person;
  sort: CommentSortType;
  bottomPadding?: number;
}

export default forwardRef<CommentsHandle, CommentsProps>(function Comments(
  { header, postId, commentPath, op, sort, bottomPadding, threadCommentId },
  ref,
) {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(0);
  const [loading, _setLoading] = useState(false);
  const loadingRef = useRef(false);
  const finishedPagingRef = useRef(false);
  const [comments, setComments] = useState<CommentView[]>([]);

  const client = useClient();
  const [isListAtTop, setIsListAtTop] = useState<boolean>(true);
  const presentToast = useAppToast();
  const defaultCommentDepth = useAppSelector(defaultCommentDepthSelector);

  const [maxContext, setMaxContext] = useState(
    commentPath
      ? commentPath.split(".").length - MAX_COMMENT_PATH_CONTEXT_DEPTH
      : 0,
  );

  const highlightedCommentId = (() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (commentPath) return +commentPath.split(".").pop()!;
    if (threadCommentId) return +threadCommentId;
    return undefined;
  })();

  const filteredComments = useMemo(() => {
    let potentialComments = comments;

    // Filter context to a single comment chain (only show direct ancestors and children)
    if (commentPath) {
      potentialComments = potentialComments.filter((c) => {
        if (
          commentPath.split(".").includes(`${c.comment.id}`) &&
          c.comment.path.split(".").length > maxContext
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

    return potentialComments;
  }, [
    commentPath,
    comments,
    highlightedCommentId,
    maxContext,
    threadCommentId,
  ]);

  const commentTree = useMemo(
    () =>
      filteredComments.length
        ? buildCommentsTreeWithMissing(
            filteredComments,
            !!commentPath || !!threadCommentId,
          )
        : [],
    [commentPath, filteredComments, threadCommentId],
  );

  const commentId = (() => {
    if (commentPath) return +commentPath.split(".")[1];
    if (threadCommentId) return +threadCommentId;
    return undefined;
  })();

  const maxDepth = (() => {
    // Viewing a single thread should always show highlighted comment, regardless of depth
    if (commentPath) {
      const commentDepth = commentPath.split(".").length;
      return Math.max(MAX_DEFAULT_COMMENT_DEPTH, commentDepth);
    }

    if (threadCommentId) return MAX_COMMENT_DEPTH + 1;

    return defaultCommentDepth;
  })();

  const virtuaRef = useRef<VListHandle>(null);

  function setLoading(loading: boolean) {
    _setLoading(loading);
    loadingRef.current = loading;
  }

  useSetActivePage(virtuaRef);

  useImperativeHandle(ref, () => ({
    appendComments,
    prependComments,
  }));

  useEffect(() => {
    fetchComments(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, commentPath, postId, client, threadCommentId]);

  async function fetchComments(refresh = false) {
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
    const reqCommentId = commentId;
    setLoading(true);

    try {
      response = await client.getComments({
        post_id: reqPostId,
        parent_id: commentId,
        limit: 10,
        sort,
        type_: "All",

        max_depth: maxDepth,

        saved_only: false,
        page: currentPage,
      });
    } catch (error) {
      if (reqPostId === postId && reqCommentId === commentId)
        presentToast({
          message: "Problem fetching comments. Please try again.",
          color: "danger",
        });

      throw error;
    } finally {
      setLoading(false);
    }

    dispatch(receivedComments(response.comments));

    if (reqPostId !== postId || reqCommentId !== commentId) return;

    const existingComments = refresh ? [] : comments;
    const newComments = pullAllBy(
      response.comments,
      existingComments,
      "comment.id",
    );
    if (!newComments.length) finishedPagingRef.current = true;

    const potentialComments = uniqBy(
      [...existingComments, ...newComments],
      (c) => c.comment.id,
    );

    setComments(potentialComments);
    setPage(currentPage);
  }

  function prependComments(comments: CommentView[]) {
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

      const newComments = uniqBy(commentsResult, (c) => c.comment.id);

      // Increase the child_count as appropriate
      comments.forEach((c) => {
        if (existingComments.some((d) => d.comment.id === c.comment.id)) return;

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
  }

  function appendComments(comments: CommentView[]) {
    setComments((existingComments) =>
      uniqBy([...existingComments, ...comments], (c) => c.comment.id),
    );
  }

  async function handleRefresh(event: RefresherCustomEvent) {
    try {
      await Promise.all([fetchComments(true), dispatch(getPost(postId))]);
    } finally {
      event.detail.complete();
    }
  }

  const allComments = useMemo(() => {
    if (loading && !comments.length)
      return [<StyledIonSpinner key="spinner" />];

    if (!comments.length)
      return [
        <Empty key="empty">
          <div>No Comments</div>
          <aside>It&apos;s quiet... too quiet...</aside>
        </Empty>,
      ];

    const tree = commentTree.map((comment, index) => (
      <CommentTree
        comment={comment}
        highlightedCommentId={highlightedCommentId}
        key={comment.comment_view.comment.id}
        first={index === 0}
        op={op}
        rootIndex={index + 1} /* Plus header index = 0 */
        baseDepth={
          commentPath
            ? commentPath.split(".").length
            : comment.comment_view.comment.path.split(".").length
        }
      />
    ));

    if (maxContext > 0)
      tree.unshift(<LoadParentComments setMaxContext={setMaxContext} />);

    return tree;
  }, [
    commentTree,
    comments.length,
    highlightedCommentId,
    loading,
    op,
    commentPath,
    maxContext,
  ]);

  const list = useMemo(() => {
    const data = [<Fragment key="header">{header}</Fragment>, ...allComments];
    if (bottomPadding)
      data.push(<div style={{ height: `${bottomPadding}px` }} key="footer" />);

    return data.map((item, i) => (
      <div data-index={i} key={item.key}>
        {item}
      </div>
    ));
  }, [allComments, bottomPadding, header]);

  return (
    <CommentsContext.Provider
      value={{
        refresh: () => fetchComments(true),
        appendComments,
        prependComments,
      }}
    >
      <IonRefresher
        slot="fixed"
        onIonRefresh={handleRefresh}
        disabled={isSafariFeedHackEnabled && !isListAtTop}
      >
        <IonRefresherContent />
      </IonRefresher>
      <VList
        className={
          isSafariFeedHackEnabled
            ? "virtual-scroller"
            : "ion-content-scroll-host virtual-scroller"
        }
        ref={virtuaRef}
        style={{ height: "100%" }}
        overscan={highlightedCommentId ? 1 : 0}
        onRangeChange={(start, end) => {
          if (end + 10 > list.length) {
            fetchComments();
          }
        }}
        onScroll={(offset) => {
          setIsListAtTop(offset < 6);
        }}
      >
        {list}
      </VList>
    </CommentsContext.Provider>
  );
});
