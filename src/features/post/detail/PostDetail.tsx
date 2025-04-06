import { useIonViewDidEnter } from "@ionic/react";
import { CommentSortType, PostView } from "lemmy-js-client";
import { useEffect, useRef, useState } from "react";

import Comments, { CommentsHandle } from "#/features/comment/inTree/Comments";
import JumpFab from "#/features/comment/inTree/JumpFab";
import { useAppDispatch, useAppSelector } from "#/store";

import { setPostRead } from "../postSlice";
import PostHeader from "./PostHeader";
import ViewAllComments from "./ViewAllComments";

interface PostDetailProps {
  post: PostView;
  sort: CommentSortType;

  commentPath: string | undefined;
  threadCommentId: string | undefined;
}

export default function PostDetail({
  post,
  sort,
  commentPath,
  threadCommentId,
}: PostDetailProps) {
  const dispatch = useAppDispatch();
  const { showJumpButton, jumpButtonPosition } = useAppSelector(
    (state) => state.settings.general.comments,
  );
  const [ionViewEntered, setIonViewEntered] = useState(false);
  const commentsRef = useRef<CommentsHandle>(undefined);

  const [viewAllCommentsSpace, setViewAllCommentsSpace] = useState(0);

  // Avoid rerender from marking a post as read until the page
  // has fully transitioned in.
  // This keeps the page transition as performant as possible
  useEffect(() => {
    if (!post || !ionViewEntered) return;

    dispatch(setPostRead(post.post.id));
  }, [post, ionViewEntered, dispatch]);

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

  return (
    <>
      <Comments
        ref={commentsRef}
        header={
          <PostHeader
            post={post}
            onPrependComment={(comment) =>
              commentsRef.current?.prependComments([comment])
            }
          />
        }
        postId={post.post.id}
        commentPath={commentPath}
        threadCommentId={threadCommentId}
        sort={sort}
        bottomPadding={bottomPadding}
      />
      {commentPath && <ViewAllComments onHeight={onHeight} />}
      {!commentPath && showJumpButton && <JumpFab />}
    </>
  );
}
