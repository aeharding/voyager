import React, { useEffect, useMemo, useRef, useState } from "react";
import { buildCommentsTree } from "../../helpers/lemmy";
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
import { PostContext } from "../post/detail/PostContext";
import { jwtSelector } from "../auth/authSlice";

const centerCss = css`
  position: relative;
  margin: 4rem 0 4rem;
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

interface CommentsProps {
  header: React.ReactNode;
  postId: number;
  commentPath?: string;
  op: Person;
  sort: CommentSortType;
  commentsLastUpdated: number;
}

export default function Comments({
  header,
  postId,
  commentPath,
  op,
  sort,
  commentsLastUpdated,
}: CommentsProps) {
  const dispatch = useAppDispatch();
  const jwt = useAppSelector(jwtSelector);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [finishedPaging, setFinishedPaging] = useState(false);
  const [comments, setComments] = useState<CommentView[]>([]);
  const commentTree = useMemo(
    () => (comments.length ? buildCommentsTree(comments, !!commentPath) : []),
    [commentPath, comments],
  );
  const client = useClient();
  const [isListAtTop, setIsListAtTop] = useState<boolean>(true);
  const [present] = useIonToast();

  const highlightedCommentId = commentPath
    ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      +commentPath.split(".").pop()!
    : undefined;
  const commentId = commentPath ? +commentPath.split(".")[1] : undefined;

  const virtuosoRef = useRef<VirtuosoHandle>(null);

  useSetActivePage(virtuosoRef);

  useEffect(() => {
    fetchComments(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, commentPath, jwt, postId, commentsLastUpdated]);

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
        max_depth: 8,
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
      "comment.id",
    );
    if (!newComments.length) setFinishedPaging(true);

    let potentialComments = uniqBy(
      [...existingComments, ...newComments],
      (c) => c.comment.id,
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
    <PostContext.Provider value={{ refreshPost: () => fetchComments(true) }}>
      <IonRefresher
        slot="fixed"
        onIonRefresh={handleRefresh}
        disabled={!isListAtTop}
      >
        <IonRefresherContent />
      </IonRefresher>
      <Virtuoso
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
                Footer: () => <div style={{ height: "70px" }} />,
              }
            : {}
        }
      />
    </PostContext.Provider>
  );
}
