import { useIonViewDidEnter } from "@ionic/react";
import { useEffect, useRef, useState } from "react";
import { PostView } from "threadiverse";

import { jwtSelector } from "#/features/auth/authSelectors";
import { VgerCommentSortType } from "#/features/comment/CommentSort";
import Comments, { CommentsHandle } from "#/features/comment/inTree/Comments";
import JumpFab from "#/features/comment/inTree/JumpFab";
import { useIsSecondColumn } from "#/routes/twoColumn/useIsSecondColumn";
import { useAppDispatch, useAppSelector } from "#/store";

import {
  markPostCommentsRead,
  markPostCommentsReadOnServer,
  setPostRead,
} from "../postSlice";
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
  const { showJumpButton, jumpButtonPosition, highlightNewComments } =
    useAppSelector((state) => state.settings.general.comments);
  const [ionViewEntered, setIonViewEntered] = useState(false);
  const isSecondColumn = useIsSecondColumn();
  const commentsRef = useRef<CommentsHandle>(undefined);

  const [viewAllCommentsSpace, setViewAllCommentsSpace] = useState(0);

  const markCommentsReadEnabled = useAppSelector(
    (state) =>
      !!jwtSelector(state) && !state.settings.general.posts.disableMarkingRead,
  );

  // A comment permalink or continued thread is a partial view of the post. The
  // full post view is the only one that marks comments read (a partial read
  // shouldn't clear the whole post's unread) and shows the unread highlight (so
  // it never competes with the navigated-to comment's own highlight).
  const isFullPostView = !commentPath && !threadCommentId;

  // Local "read these comments in-session" override, if set (e.g. on re-entry).
  const localReadCommentsAt = useAppSelector(
    (state) => state.post.postReadCommentsAtById[post.post.id],
  );

  // The unread-comment highlight boundary: comments published after this were
  // posted since the user last read the post. Captured once on mount so it
  // stays stable as the store is refreshed/overridden underneath. The local
  // override (set on a prior open this session) wins over the server value, so
  // re-opening doesn't re-tint comments we already read. Only Lemmy v1 provides
  // read_comments_at; v0/PieFed leave it undefined (no highlight). Per-page
  // (not global) so opening the same post in another stack can't clobber it.
  const [unreadAfter] = useState(
    () => localReadCommentsAt ?? post.read_comments_at,
  );

  // Mark-read work runs once per opened post.
  const openedReadPostIdRef = useRef<number>(undefined);

  // Avoid rerender from marking a post as read until the page
  // has fully transitioned in.
  // This keeps the page transition as performant as possible
  useEffect(() => {
    if (!post) return;

    // Wait until the page has fully transitioned in
    // (only applies to single column mode)
    if (!isSecondColumn && !ionViewEntered) return;

    dispatch(setPostRead(post.post.id));

    // Only when there are unread comments to reset. This skips the getPost on
    // already-read and commentless posts (most opens), while still firing for
    // never-opened-with-comments posts (their unread === total > 0) so the
    // server records a baseline and future comments can show as "new".
    if (
      markCommentsReadEnabled &&
      isFullPostView &&
      post.unread_comments > 0 &&
      openedReadPostIdRef.current !== post.post.id
    ) {
      openedReadPostIdRef.current = post.post.id;

      // Fetching the post resets the server's read-comments baseline (getPost →
      // update_read_comments), so the feed's "X new" pill reflects truly-new
      // comments next time. Response ignored.
      dispatch(markPostCommentsReadOnServer(post.post.id));

      // Optimistically mark comments read now, while the feed is off-screen
      // behind this page — same timing as the read-dimming, so no flicker when
      // returning. Hides the pill + advances the highlight boundary (re-entry
      // won't re-tint). The title's "X New" snapshot (PostPage) survives this.
      dispatch(
        markPostCommentsRead({
          postId: post.post.id,
          readCommentsAt: new Date().toISOString(),
        }),
      );
    }
  }, [
    post,
    ionViewEntered,
    dispatch,
    isSecondColumn,
    markCommentsReadEnabled,
    isFullPostView,
  ]);

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
            key="post-header"
          />
        }
        postId={post.post.id}
        commentPath={commentPath}
        threadCommentId={threadCommentId}
        sort={sort}
        bottomPadding={bottomPadding}
        virtualEnabled={virtualEnabled}
        unreadAfter={
          isFullPostView && highlightNewComments ? unreadAfter : undefined
        }
      />
      {commentPath && <ViewAllComments onHeight={onHeight} />}
      {!commentPath && showJumpButton && <JumpFab />}
    </>
  );
}
