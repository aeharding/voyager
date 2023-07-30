import React, {
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
import CommentTree from "./CommentTree";
import {
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  useIonToast,
} from "@ionic/react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { CommentSortType, CommentView, Person } from "lemmy-js-client";
import { pullAllBy, uniqBy } from "lodash";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { useAppDispatch, useAppSelector } from "../../store";
import { receivedComments } from "./commentSlice";
import { RefresherCustomEvent } from "@ionic/core";
import { getPost } from "../post/postSlice";
import useClient from "../../helpers/useClient";
import { useSetActivePage } from "../auth/AppContext";
import { CommentsContext } from "./CommentsContext";
import { jwtSelector } from "../auth/authSlice";
import { defaultCommentDepthSelector } from "../settings/settingsSlice";
import { isSafariFeedHackEnabled } from "../../pages/shared/FeedContent";

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

export type CommentsHandle = {
  appendComments: (comments: CommentView[]) => void;
  prependComments: (comments: CommentView[]) => void;
};

interface CommentsProps {
  header: React.ReactNode;
  postId: number;
  commentPath?: string;
  op: Person;
  sort: CommentSortType;
  bottomPadding?: number;
}

export default forwardRef<CommentsHandle, CommentsProps>(function Comments(
  { header, postId, commentPath, op, sort, bottomPadding },
  ref
) {
  const dispatch = useAppDispatch();
  const jwt = useAppSelector(jwtSelector);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [finishedPaging, setFinishedPaging] = useState(false);
  const [comments, setComments] = useState<CommentView[]>([]);
  const commentTree = useMemo(
    () =>
      comments.length
        ? buildCommentsTreeWithMissing(comments, !!commentPath)
        : [],
    [commentPath, comments]
  );
  const client = useClient();
  const [isListAtTop, setIsListAtTop] = useState<boolean>(true);
  const [present] = useIonToast();
  const defaultCommentDepth = useAppSelector(defaultCommentDepthSelector);

  const highlightedCommentId = commentPath
    ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      +commentPath.split(".").pop()!
    : undefined;
  const commentId = commentPath ? +commentPath.split(".")[1] : undefined;
  const commentDepth = commentPath ? commentPath.split(".").length : undefined;

  const virtuosoRef = useRef<VirtuosoHandle>(null);

  useSetActivePage(virtuosoRef);

  useImperativeHandle(ref, () => ({
    appendComments,
    prependComments,
  }));

  useEffect(() => {
    fetchComments(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, commentPath, jwt, postId]);

  async function fetchComments(refresh = false) {
    if (refresh) {
      setFinishedPaging(false);
    } else {
      if (loading) return;
      if (finishedPaging) return;
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

        // Viewing a single thread should always show highlighted comment, regardless of depth
        max_depth: commentDepth
          ? Math.max(MAX_DEFAULT_COMMENT_DEPTH, commentDepth)
          : defaultCommentDepth,

        saved_only: false,
        page: currentPage,
        auth: jwt,
      });
    } catch (error) {
      if (reqPostId === postId && reqCommentId === commentId)
        present({
          message: "Problem fetching comments. Please try again.",
          duration: 3500,
          position: "bottom",
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
      "comment.id"
    );
    if (!newComments.length) setFinishedPaging(true);

    let potentialComments = uniqBy(
      [...existingComments, ...newComments],
      (c) => c.comment.id
    );

    // Filter context to a single comment chain (only show direct ancestors and children)
    if (commentPath)
      potentialComments = potentialComments.filter((c) => {
        if (commentPath.split(".").includes(`${c.comment.id}`)) return true;
        if (
          highlightedCommentId &&
          c.comment.path.split(".").includes(`${highlightedCommentId}`)
        )
          return true;
        return false;
      });

    setComments(potentialComments);
    setPage(currentPage);
  }

  function prependComments(comments: CommentView[]) {
    setComments((existingComments) => {
      let commentsResult;

      // We want to *unshift* comments, so that they appear as first child(ren) of a given node

      // if `commentPath` exists, we call `buildCommentsTree` with `true`
      if (commentPath) {
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
      uniqBy([...existingComments, ...comments], (c) => c.comment.id)
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

    return commentTree.map((comment, index) => (
      <CommentTree
        comment={comment}
        highlightedCommentId={highlightedCommentId}
        key={comment.comment_view.comment.id}
        first={index === 0}
        op={op}
        rootIndex={index + 1} /* Plus header index = 0 */
      />
    ));
  }, [commentTree, comments.length, highlightedCommentId, loading, op]);

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
      <Virtuoso
        className={
          isSafariFeedHackEnabled ? undefined : "ion-content-scroll-host"
        }
        ref={virtuosoRef}
        style={{ height: "100%" }}
        totalCount={allComments.length + 1}
        itemContent={(index) => (index ? allComments[index - 1] : header)}
        endReached={() => fetchComments()}
        atTopStateChange={setIsListAtTop}
        components={
          typeof commentId === "number"
            ? {
                // add space for the <ViewAllComments /> fixed component
                Footer: () => <div style={{ height: `${bottomPadding}px` }} />,
              }
            : {}
        }
      />
    </CommentsContext.Provider>
  );
});
