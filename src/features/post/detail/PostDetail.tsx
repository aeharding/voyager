import { useIonViewDidEnter } from "@ionic/react";
import React, { useEffect, useRef, useState } from "react";
import { PostView } from "threadiverse";

import { modeSelector } from "#/features/auth/siteSlice";
import { VgerCommentSortType } from "#/features/comment/CommentSort";
import Comments, { CommentsHandle } from "#/features/comment/inTree/Comments";
import CommunityCommentSectionHeader from "#/features/comment/inTree/CommunityCommentSectionHeader";
import CrossCommunityComments from "#/features/comment/inTree/CrossCommunityComments";
import JumpFab from "#/features/comment/inTree/JumpFab";
import { useIsSecondColumn } from "#/routes/twoColumn/useIsSecondColumn";
import { useAppDispatch, useAppSelector } from "#/store";

import { crossPostsSelector, setPostRead } from "../postSlice";
import PostHeader from "./PostHeader";
import ViewAllComments from "./ViewAllComments";

interface PostDetailProps {
  post: PostView;
  sort: VgerCommentSortType | null | undefined;

  commentPath: string | undefined;
  threadCommentId: string | undefined;
  virtualEnabled?: boolean;
}

export default function PostDetail({
  post,
  sort,
  commentPath,
  threadCommentId,
  virtualEnabled,
}: PostDetailProps) {
  const dispatch = useAppDispatch();
  const { showJumpButton, jumpButtonPosition } = useAppSelector(
    (state) => state.settings.general.comments,
  );
  const mode = useAppSelector(modeSelector);
  const crossPosts = useAppSelector(crossPostsSelector(post.post.id));
  const hasCrossPosts = mode === "piefed" && crossPosts.length > 0;
  const [primaryCollapsed, setPrimaryCollapsed] = useState(false);
  const [crossPostCollapsed, setCrossPostCollapsed] = useState<Record<number, boolean>>({});
  const [ionViewEntered, setIonViewEntered] = useState(false);
  const isSecondColumn = useIsSecondColumn();
  const commentsRef = useRef<CommentsHandle>(undefined);

  const [viewAllCommentsSpace, setViewAllCommentsSpace] = useState(0);

  // Avoid rerender from marking a post as read until the page
  // has fully transitioned in.
  // This keeps the page transition as performant as possible
  useEffect(() => {
    if (!post) return;

    // Wait until the page has fully transitioned in
    // (only applies to single column mode)
    if (!isSecondColumn && !ionViewEntered) return;

    dispatch(setPostRead(post.post.id));
  }, [post, ionViewEntered, dispatch, isSecondColumn]);

  useIonViewDidEnter(() => {
    setIonViewEntered(true);
  });

  function onHeight(height: number) {
    setViewAllCommentsSpace(height);
  }

  const bottomPadding: number = (() => {
    if (commentPath) {
      if (!viewAllCommentsSpace) return 0;

      return viewAllCommentsSpace + 12;
    }

    if (
      showJumpButton &&
      (jumpButtonPosition === "left-bottom" ||
        jumpButtonPosition === "center" ||
        jumpButtonPosition === "right-bottom")
    )
      return 75;

    return 0;
  })();

  const trailer: React.ReactNode[] = hasCrossPosts
    ? crossPosts.map((crossPost) => (
        <CrossCommunityComments
          key={crossPost.post.id}
          crossPost={crossPost}
          sort={sort}
          isCollapsed={crossPostCollapsed[crossPost.post.id] ?? false}
          onToggle={() =>
            setCrossPostCollapsed((prev) => ({
              ...prev,
              [crossPost.post.id]: !(prev[crossPost.post.id] ?? false),
            }))
          }
        />
      ))
    : [];

  return (
    <>
      <Comments
        ref={commentsRef}
        header={
          <>
            <PostHeader
              post={post}
              onPrependComment={(comment) =>
                commentsRef.current?.prependComments([comment])
              }
            />
            {hasCrossPosts && (
              <CommunityCommentSectionHeader
                community={post.community}
                subscribed={post.subscribed}
                commentCount={post.counts.comments}
                isCollapsed={primaryCollapsed}
                onToggle={() => setPrimaryCollapsed((c) => !c)}
              />
            )}
          </>
        }
        postId={post.post.id}
        commentPath={commentPath}
        threadCommentId={threadCommentId}
        sort={sort}
        bottomPadding={bottomPadding}
        trailer={trailer}
        collapsed={primaryCollapsed}
        virtualEnabled={virtualEnabled}
      />
      {commentPath && <ViewAllComments onHeight={onHeight} />}
      {!commentPath && showJumpButton && <JumpFab />}
    </>
  );
}
