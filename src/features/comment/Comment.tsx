import { IonItem } from "@ionic/react";
import { cx } from "@linaria/core";
import { styled } from "@linaria/react";
import { CommentView } from "lemmy-js-client";
import React, { MouseEvent, useRef } from "react";
import AnimateHeight from "react-animate-height";
import { useLongPress } from "use-long-press";

import Save from "#/features/labels/Save";
import { ModeratableItemBannerOutlet } from "#/features/moderation/ModeratableItem";
import ModeratableItem from "#/features/moderation/ModeratableItem";
import useCanModerate from "#/features/moderation/useCanModerate";
import SlidingNestedCommentVote from "#/features/shared/sliding/SlidingNestedCommentVote";
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

export const CustomIonItem = styled(IonItem)`
  scroll-margin-bottom: 35vh;

  --padding-start: 0;
  --inner-padding-end: 0;
  --border-style: none;
  --min-height: 0;
`;

const Content = styled.div`
  padding-top: 0.35em;

  display: flex;
  flex-direction: column;
  gap: 1em;

  @media (hover: none) {
    padding-top: 0.45em;
  }

  line-height: 1.25;
`;

interface CommentProps {
  comment: CommentView;
  highlightedCommentId?: number;
  depth?: number;
  absoluteDepth?: number;
  onClick?: (e: MouseEvent) => void;
  collapsed?: boolean;
  routerLink?: string;

  /** On profile view, this is used to show post replying to */
  context?: React.ReactNode;

  className?: string;

  rootIndex?: number;
}

export default function Comment({
  comment: commentView,
  highlightedCommentId,
  depth,
  absoluteDepth,
  onClick,
  collapsed: _collapsed,
  context,
  routerLink,
  className,
  rootIndex,
}: CommentProps) {
  const showCollapsedComment = useAppSelector(
    (state) => state.settings.general.comments.showCollapsed,
  );
  const commentFromStore = useAppSelector(
    (state) => state.comment.commentById[commentView.comment.id],
  );

  // Comment from slice might be more up to date, e.g. edits
  const comment = commentFromStore ?? commentView.comment;

  const canModerate = useCanModerate(commentView.community);

  const commentEllipsisHandleRef = useRef<CommentEllipsisHandle>(null);

  const stub = isStubComment(comment, canModerate);

  const cannotCollapse =
    (showCollapsedComment || stub) && !commentView.counts.child_count;

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
      className={cx(className, "comment")}
      rootIndex={rootIndex}
      collapsed={!!collapsed}
    >
      <CustomIonItem
        mode="ios" // Use iOS style activatable tap highlight
        className={cx(
          !cannotCollapse && isTouchDevice() && "ion-activatable",
          `comment-${comment.id}`,
        )}
        routerLink={routerLink}
        href={undefined}
        onClick={(e) => {
          if (preventOnClickNavigationBug(e)) return;

          onClick?.(e);
        }}
        {...bind()}
      >
        <ModeratableItem
          itemView={commentView}
          highlighted={highlightedCommentId === comment.id}
        >
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
                    <Content
                      onClick={(e) => {
                        if (!(e.target instanceof HTMLElement)) return;
                        if (e.target.nodeName === "A") e.stopPropagation();
                      }}
                    >
                      {!stub && (
                        <CommentContent
                          item={comment}
                          showTouchFriendlyLinks={!context}
                          mdClassName="collapse-md-margins"
                        />
                      )}
                      {context}
                    </Content>
                  ) : undefined}
                </AnimateHeight>
              </div>
            </CommentContainer>
            <Save type="comment" id={commentView.comment.id} />
          </PositionedContainer>
        </ModeratableItem>
      </CustomIonItem>
    </SlidingNestedCommentVote>
  );
}
