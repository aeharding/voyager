import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { LIMIT, getClient } from "../services/lemmy";
import { CommentNodeI, buildCommentsTree } from "../helpers/lemmy";
import CommentTree from "./CommentTree";
import {
  IonLoading,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  useIonToast,
  useIonViewWillEnter,
} from "@ionic/react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { CommentView, ListingType, Person } from "lemmy-js-client";
import { pullAllBy, uniqBy } from "lodash";
import { useLocation } from "react-router";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { useAppDispatch, useAppSelector } from "../store";
import { receivedComments } from "../features/comment/commentSlice";
import { RefresherCustomEvent } from "@ionic/core";
import { getPost } from "../features/post/postSlice";
import useClient from "../helpers/useClient";
import { AppContext } from "../features/auth/AppContext";
import { PostContext } from "../features/post/detail/PostContext";

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
}

export default function Comments({
  header,
  postId,
  commentPath,
  op,
}: CommentsProps) {
  const dispatch = useAppDispatch();
  const jwt = useAppSelector((state) => state.auth.jwt);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [finishedPaging, setFinishedPaging] = useState(false);
  const [comments, setComments] = useState<CommentView[]>([]);
  const commentTree = useMemo(
    () => (comments.length ? buildCommentsTree(comments, !!commentPath) : []),
    [comments]
  );
  const client = useClient();
  const [isListAtTop, setIsListAtTop] = useState<boolean>(true);
  const [present] = useIonToast();

  const highlightedCommentId = commentPath
    ? +commentPath.split(".").pop()!
    : undefined;
  const commentId = commentPath ? +commentPath.split(".")[1] : undefined;

  const { setActivePage } = useContext(AppContext);
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  useIonViewWillEnter(() => {
    setActivePage(virtuosoRef);
  });

  useEffect(() => {
    fetchComments(true);
  }, [postId, commentId]);

  async function fetchComments(refresh = false) {
    if (refresh) {
      setLoading(false);
      setFinishedPaging(false);
      setPage(0);
      setComments([]);
    }

    let response;

    if (loading) return;
    if (finishedPaging) return;

    const currentPage = page + 1;

    const reqPostId = postId;
    const reqCommentId = commentId;
    setLoading(true);

    try {
      response = await client.getComments({
        post_id: reqPostId,
        parent_id: commentId,
        limit: 10,
        sort: "Hot",
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
      "comment.id"
    );
    if (!newComments.length) setFinishedPaging(true);

    let potentialComments = uniqBy(
      [...comments, ...newComments],
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

  async function handleRefresh(event: RefresherCustomEvent) {
    try {
      await Promise.all([fetchComments(true), dispatch(getPost(postId))]);
    } finally {
      event.detail.complete();
    }
  }

  const allComments = (() => {
    if (loading && !comments.length) return [<StyledIonSpinner />];

    if (!comments.length)
      return [
        <Empty>
          <div>No Comments</div>
          <aside>It's quiet... too quiet...</aside>
        </Empty>,
      ];

    return commentTree.map((comment, index) => (
      <CommentTree
        comment={comment}
        highlightedCommentId={highlightedCommentId}
        key={comment.comment_view.comment.id}
        first={index === 0}
        op={op}
      />
    ));
  })();

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
