import { IonSpinner } from "@ionic/react";
import { useCallback, useEffect, useEffectEvent, useMemo, useState } from "react";
import { CommentView, PostView } from "threadiverse";

import { VgerCommentSortType } from "#/features/comment/CommentSort";
import { useFeedSortParams } from "#/features/feed/sort/useFeedSort";
import {
  appendCrossPostComments,
  crossPostCommentsSelector,
  prependCrossPostComments,
  receivedCrossPostComments,
} from "#/features/post/postSlice";
import { defaultCommentDepthSelector } from "#/features/settings/settingsSlice";
import { buildCommentsTreeWithMissing } from "#/helpers/lemmy";
import useClient from "#/helpers/useClient";
import { useAppDispatch, useAppSelector } from "#/store";

import { receivedComments } from "../commentSlice";
import { CommentsContext } from "./CommentsContext";
import CommentTree from "./CommentTree";
import CommunityCommentSectionHeader from "./CommunityCommentSectionHeader";

import styles from "./CrossCommunityComments.module.css";

interface CrossCommunityCommentsProps {
  crossPost: PostView;
  sort: VgerCommentSortType | null | undefined;
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function CrossCommunityComments({
  crossPost,
  sort,
  isCollapsed,
  onToggle,
}: CrossCommunityCommentsProps) {
  const dispatch = useAppDispatch();
  const client = useClient();
  const postId = crossPost.post.id;
  const cachedComments = useAppSelector(crossPostCommentsSelector(postId));
  const [loading, setLoading] = useState(cachedComments === undefined);
  const [failed, setFailed] = useState(false);
  const defaultCommentDepth = useAppSelector(defaultCommentDepthSelector);
  const sortParams = useFeedSortParams("comments", sort);

  const comments = useMemo(() => cachedComments ?? [], [cachedComments]);

  const fetchComments = useCallback(async () => {
    if (!sortParams) return;
    setLoading(true);
    setFailed(false);
    try {
      const response = await client.getComments({
        post_id: postId,
        type_: "All",
        limit: 60,
        max_depth: defaultCommentDepth,
        ...sortParams,
      });
      dispatch(receivedComments(response.data));
      dispatch(receivedCrossPostComments({ postId, comments: response.data }));
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [client, postId, defaultCommentDepth, dispatch, sortParams]);

  const fetchCommentsEvent = useEffectEvent(fetchComments);

  useEffect(() => {
    if (cachedComments !== undefined) return;
    fetchCommentsEvent();
  }, [cachedComments]);

  const commentTree = useMemo(
    () =>
      comments.length ? buildCommentsTreeWithMissing(comments, false) : [],
    [comments],
  );

  const appendComments = useCallback(
    (newComments: CommentView[]) => {
      dispatch(appendCrossPostComments({ postId, comments: newComments }));
    },
    [dispatch, postId],
  );

  const prependComments = useCallback(
    (newComments: CommentView[]) => {
      dispatch(prependCrossPostComments({ postId, comments: newComments }));
    },
    [dispatch, postId],
  );

  const getComments = useCallback(() => comments, [comments]);

  const commentsContextValue = useMemo(
    () => ({
      refresh: fetchComments,
      appendComments,
      prependComments,
      getComments,
    }),
    [fetchComments, appendComments, prependComments, getComments],
  );

  function renderBody() {
    if (loading)
      return (
        <div className={styles.spinnerContainer}>
          <IonSpinner />
        </div>
      );
    if (failed)
      return <div className={styles.message}>Failed to load comments</div>;
    if (comments.length === 0)
      return <div className={styles.message}>No comments</div>;
    return commentTree.map((comment, index) => (
      <CommentTree
        key={comment.comment_view.comment.id}
        comment={comment}
        first={index === 0}
        rootIndex={index + 1}
        baseDepth={comment.absoluteDepth}
      />
    ));
  }

  return (
    <CommentsContext value={commentsContextValue}>
      <CommunityCommentSectionHeader
        community={crossPost.community}
        subscribed={crossPost.subscribed}
        commentCount={crossPost.counts.comments}
        isCollapsed={isCollapsed}
        onToggle={onToggle}
      />
      {!isCollapsed && renderBody()}
    </CommentsContext>
  );
}
