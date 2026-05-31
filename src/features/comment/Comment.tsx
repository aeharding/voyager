import { IonItem } from "@ionic/react";
import React, { MouseEvent, useRef } from "react";
import AnimateHeight from "react-animate-height";
import { CommentView } from "threadiverse";
import { useLongPress } from "use-long-press";

import { userPersonSelector } from "#/features/auth/siteSlice";
import Save from "#/features/labels/Save";
import { ModeratableItemBannerOutlet } from "#/features/moderation/ModeratableItem";
import ModeratableItem from "#/features/moderation/ModeratableItem";
import useCanModerate from "#/features/moderation/useCanModerate";
import SlidingNestedCommentVote from "#/features/shared/sliding/SlidingNestedCommentVote";
import { cx } from "#/helpers/css";
import { isTouchDevice } from "#/helpers/device";
import {
  preventOnClickNavigationBug,
  stopIonicTapClick,
} from "#/helpers/ionic";
import { filterEvents } from "#/helpers/longPress";
import { useAppSelector } from "#/store";

import CommentContent from "./CommentContent";
import { CommentEllipsisHandle } from "./CommentEllipsis";
import CommentHeader, { isStubComment } from "./CommentHeader";
import CommentContainer from "./elements/CommentContainer";
import { PositionedContainer } from "./elements/PositionedContainer";

import styles from "./Comment.module.css";

/**
 * How a comment in the tree may be highlighted. The two modes never co-occur —
 * a thread/permalink view highlights the navigated-to comment; the full post
 * view highlights comments unread since `after` — so they're one prop.
 */
export type CommentHighlight =
  | { type: "commentInThread"; commentId: number }
  | { type: "unread"; after: Date };

interface CommentProps {
  comment: CommentView;

  highlight?: CommentHighlight;
  depth?: number;
  absoluteDepth?: number;
  onClick?: (e: MouseEvent) => void;
  collapsed?: boolean;
  routerLink?: string;

  /** On profile view, this is used to show post replying to */
  context?: React.ReactNode;

  className?: string;

  itemClassName?: string;

  rootIndex?: number;
}

export default function Comment({
  comment: commentView,
  highlight,
  depth,
  absoluteDepth,
  onClick,
  collapsed: _collapsed,
  context,
  routerLink,
  className,
  itemClassName,
  rootIndex,
}: CommentProps) {
  const showCollapsedComment = useAppSelector(
    (state) => state.settings.general.comments.showCollapsed,
  );
  const commentFromStore = useAppSelector(
    (state) => state.comment.commentById[commentView.comment.id],
  );
  const myUserId = useAppSelector(userPersonSelector)?.id;

  // Comment from slice might be more up to date, e.g. edits
  const comment = commentFromStore ?? commentView.comment;

  const isThreadTarget =
    highlight?.type === "commentInThread" && highlight.commentId === comment.id;

  // Posted since the user last read the post (and not by them) → unread. Lemmy
  // marks your own comments read on creation, so skipping them matches the
  // server's own unread count.
  const isUnread =
    highlight?.type === "unread" &&
    comment.creator_id !== myUserId &&
    new Date(comment.published_at).getTime() > highlight.after.getTime();

  const canModerate = useCanModerate(commentView.community);

  const commentEllipsisHandleRef = useRef<CommentEllipsisHandle>(undefined);

  const stub = isStubComment(comment, canModerate);

  const cannotCollapse =
    (showCollapsedComment || stub) && !commentView.comment.child_count;

  const collapsed = cannotCollapse ? false : _collapsed;

  function onCommentLongPress() {
    commentEllipsisHandleRef.current?.present();
    stopIonicTapClick();
  }

  const bind = useLongPress(onCommentLongPress, {
    threshold: 800,
    cancelOnMovement: 15,
    filterEvents,
  });

  return (
    <SlidingNestedCommentVote
      item={commentView}
      className={className}
      rootIndex={rootIndex}
      collapsed={!!collapsed}
    >
      <IonItem
        mode="ios" // Use iOS style activatable tap highlight
        className={cx(
          styles.commentItem,
          isUnread && styles.unread,
          !cannotCollapse && isTouchDevice() && "ion-activatable",
          `comment-${comment.id}`,
          itemClassName,
        )}
        routerLink={routerLink}
        href={undefined}
        onClick={(e) => {
          if (preventOnClickNavigationBug(e)) return;

          onClick?.(e);
        }}
        {...bind()}
      >
        <ModeratableItem itemView={commentView} highlighted={isThreadTarget}>
          <PositionedContainer
            depth={absoluteDepth === depth ? depth || 0 : (depth || 0) + 1}
          >
            <CommentContainer depth={absoluteDepth ?? depth ?? 0}>
              <ModeratableItemBannerOutlet />
              <div>
                <CommentHeader
                  canModerate={canModerate}
                  commentView={commentView}
                  comment={comment}
                  context={context}
                  collapsed={collapsed}
                  rootIndex={rootIndex}
                  commentEllipsisHandleRef={commentEllipsisHandleRef}
                />

                <AnimateHeight
                  duration={200}
                  height={!showCollapsedComment && collapsed ? 0 : "auto"}
                >
                  {!stub || context ? (
                    <div className={styles.content}>
                      {!stub && (
                        <CommentContent
                          item={comment}
                          showTouchFriendlyLinks={!context}
                          mdClassName="collapse-md-margins"
                          canModerate={canModerate}
                        />
                      )}
                      {context}
                    </div>
                  ) : undefined}
                </AnimateHeight>
              </div>
            </CommentContainer>
            <Save type="comment" id={commentView.comment.id} />
          </PositionedContainer>
        </ModeratableItem>
      </IonItem>
    </SlidingNestedCommentVote>
  );
}
