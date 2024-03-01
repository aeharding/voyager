import { IonIcon, IonItem } from "@ionic/react";
import { chevronDownOutline } from "ionicons/icons";
import { CommentView } from "lemmy-js-client";
import React, { MouseEvent, memo, useCallback, useRef } from "react";
import Ago from "../labels/Ago";
import PersonLink from "../labels/links/PersonLink";
import Vote from "../labels/Vote";
import AnimateHeight from "react-animate-height";
import CommentContent from "./CommentContent";
import SlidingNestedCommentVote from "../shared/sliding/SlidingNestedCommentVote";
import CommentEllipsis, { CommentEllipsisHandle } from "./CommentEllipsis";
import { useAppSelector } from "../../store";
import Save from "../labels/Save";
import Edited from "../labels/Edited";
import ModActions from "./ModActions";
import { ModeratableItemBannerOutlet } from "../moderation/ModeratableItem";
import ModeratableItem from "../moderation/ModeratableItem";
import useCanModerate from "../moderation/useCanModerate";
import ModqueueItemActions from "../moderation/ModqueueItemActions";
import { ActionsContainer } from "../post/inFeed/compact/CompactPost";
import { useLongPress } from "use-long-press";
import { filterSafariCallout } from "../../helpers/longPress";
import { useInModqueue } from "../../routes/pages/shared/ModqueuePage";
import { preventOnClickNavigationBug } from "../../helpers/ionic";
import { styled } from "@linaria/react";
import { PositionedContainer } from "./elements/PositionedContainer";
import { Container } from "./elements/Container";

export const CustomIonItem = styled(IonItem)`
  scroll-margin-bottom: 35vh;

  --padding-start: 0;
  --inner-padding-end: 0;
  --border-style: none;
  --min-height: 0;
`;

const Header = styled.div`
  display: flex;
  align-items: center;

  font-size: 0.875em;

  gap: 0.5em;

  color: var(--ion-color-medium2);
`;

const StyledPersonLabel = styled(PersonLink)`
  && {
    color: var(--ion-text-color);
  }

  min-width: 0;
  overflow: hidden;
`;

const CommentVote = styled(Vote)`
  // Increase tap target
  padding: 6px 3px;
  margin: -6px -3px;
`;

const Content = styled.div`
  padding-top: 0.35em;

  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (hover: none) {
    padding-top: 0.45em;
  }

  line-height: 1.25;
`;

const CollapsedIcon = styled(IonIcon)`
  font-size: 1.2em;
`;

const AmountCollapsed = styled.div`
  font-size: 0.875em;
  padding: 2px 8px;
  margin: -4px 0;
  border-radius: 16px;
  color: var(--ion-color-medium);
  background: var(--ion-color-light);
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

export default memo(Comment);

function Comment({
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

  const inModqueue = useInModqueue();

  // Comment from slice might be more up to date, e.g. edits
  const comment = commentFromStore ?? commentView.comment;

  const canModerate = useCanModerate(commentView.community);

  const commentEllipsisHandleRef = useRef<CommentEllipsisHandle>(null);

  const collapsed =
    showCollapsedComment && !commentView.counts.child_count
      ? false
      : _collapsed;

  const onCommentLongPress = useCallback(() => {
    commentEllipsisHandleRef.current?.present();
  }, []);

  const bind = useLongPress(onCommentLongPress, {
    threshold: 800,
    cancelOnMovement: true,
    filterEvents: filterSafariCallout,
  });

  function renderActions() {
    if (inModqueue) return <ModqueueItemActions item={commentView} />;

    if (canModerate)
      return <ModActions comment={commentView} role={canModerate} />;
  }

  return (
    <SlidingNestedCommentVote
      item={commentView}
      className={className}
      rootIndex={rootIndex}
      collapsed={!!collapsed}
    >
      <CustomIonItem
        routerLink={routerLink}
        href={undefined}
        onClick={(e) => {
          if (preventOnClickNavigationBug(e)) return;

          onClick?.(e);
        }}
        className={`comment-${comment.id}`}
        {...bind()}
      >
        <ModeratableItem
          itemView={commentView}
          highlighted={highlightedCommentId === comment.id}
        >
          <PositionedContainer
            depth={absoluteDepth === depth ? depth || 0 : (depth || 0) + 1}
          >
            <Container depth={absoluteDepth ?? depth ?? 0}>
              <ModeratableItemBannerOutlet />
              <div>
                <Header>
                  <StyledPersonLabel
                    person={commentView.creator}
                    opId={commentView.post.creator_id}
                    distinguished={comment.distinguished}
                    showBadge={!context}
                  />
                  <CommentVote item={commentView} />
                  <Edited item={commentView} />
                  <div style={{ flex: 1 }} />
                  <ActionsContainer
                    className={collapsed ? "ion-hide" : undefined}
                  >
                    {renderActions()}
                    <CommentEllipsis
                      comment={commentView}
                      rootIndex={rootIndex}
                      ref={commentEllipsisHandleRef}
                    />
                    <Ago date={comment.published} />
                  </ActionsContainer>
                  {collapsed && (
                    <>
                      <AmountCollapsed>
                        {commentView.counts.child_count +
                          (showCollapsedComment ? 0 : 1)}
                      </AmountCollapsed>
                      <CollapsedIcon icon={chevronDownOutline} />
                    </>
                  )}
                </Header>

                <AnimateHeight
                  duration={200}
                  height={!showCollapsedComment && collapsed ? 0 : "auto"}
                >
                  <Content
                    onClick={(e) => {
                      if (!(e.target instanceof HTMLElement)) return;
                      if (e.target.nodeName === "A") e.stopPropagation();
                    }}
                  >
                    <CommentContent
                      item={comment}
                      showTouchFriendlyLinks={!context}
                      isMod={!!canModerate}
                      mdClassName="collapse-md-margins"
                    />
                    {context}
                  </Content>
                </AnimateHeight>
              </div>
            </Container>
            <Save type="comment" id={commentView.comment.id} />
          </PositionedContainer>
        </ModeratableItem>
      </CustomIonItem>
    </SlidingNestedCommentVote>
  );
}
