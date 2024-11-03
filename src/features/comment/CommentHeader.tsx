import { IonIcon } from "@ionic/react";
import { styled } from "@linaria/react";
import { chevronDownOutline } from "ionicons/icons";
import { Comment, CommentView } from "lemmy-js-client";
import { RefObject } from "react";

import Ago from "#/features/labels/Ago";
import Edited from "#/features/labels/Edited";
import Vote from "#/features/labels/Vote";
import PersonLink from "#/features/labels/links/PersonLink";
import ModqueueItemActions from "#/features/moderation/ModqueueItemActions";
import { ModeratorRole } from "#/features/moderation/useCanModerate";
import { ActionButton } from "#/features/post/actions/ActionButton";
import { ActionsContainer } from "#/features/post/inFeed/compact/CompactPost";
import UserScore from "#/features/tags/UserScore";
import UserTag from "#/features/tags/UserTag";
import { useInModqueue } from "#/routes/pages/shared/ModqueuePage";
import { useAppSelector } from "#/store";

import CommentEllipsis, { CommentEllipsisHandle } from "./CommentEllipsis";
import ModActions from "./ModActions";

const Header = styled.div`
  display: flex;
  align-items: center;

  font-size: 0.875em;

  gap: 0.5em;

  color: var(--ion-color-medium2);
`;

const StyledPersonLink = styled(PersonLink)`
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

const CollapsedIcon = styled(IonIcon)`
  font-size: 1.2em;
`;

const AmountCollapsed = styled.div`
  font-size: 0.875em;
  padding: 2px 8px;
  margin: -4px 0;
  border-radius: 16px;
  color: var(--ion-color-medium);
  background: var(--lightroom-bg);
`;

const DeletedLabel = styled.div`
  font-style: italic;
  color: var(--ion-color-medium);

  min-width: 0;
  overflow: hidden;
`;

const Spacer = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  display: flex;
`;

interface CommentHeaderProps {
  canModerate: ModeratorRole | undefined;
  commentView: CommentView;
  comment: Comment;
  context: React.ReactNode;
  collapsed: boolean | undefined;
  rootIndex: number | undefined;
  commentEllipsisHandleRef: RefObject<CommentEllipsisHandle>;
}

export default function CommentHeader({
  canModerate,
  commentView,
  comment,
  context,
  collapsed,
  rootIndex,
  commentEllipsisHandleRef,
}: CommentHeaderProps) {
  const showCollapsedComment = useAppSelector(
    (state) => state.settings.general.comments.showCollapsed,
  );
  const inModqueue = useInModqueue();

  function renderActions() {
    if (inModqueue) return <ModqueueItemActions item={commentView} />;

    if (canModerate)
      return <ModActions comment={commentView} role={canModerate} />;
  }

  const stub = isStubComment(comment, canModerate);

  function renderAside(agoTimestamp = comment.published) {
    return (
      <>
        <ActionsContainer className={collapsed ? "ion-hide" : undefined}>
          {renderActions()}
          <ActionButton>
            <CommentEllipsis
              comment={commentView}
              rootIndex={rootIndex}
              ref={commentEllipsisHandleRef}
            />
          </ActionButton>
          <Ago date={agoTimestamp} />
        </ActionsContainer>
        {collapsed && (
          <>
            <AmountCollapsed>
              {commentView.counts.child_count +
                (showCollapsedComment || stub ? 0 : 1)}
            </AmountCollapsed>
            <CollapsedIcon icon={chevronDownOutline} />
          </>
        )}
      </>
    );
  }

  const content = (() => {
    switch (stub) {
      case StubType.Deleted:
        return (
          <>
            <DeletedLabel>
              <PersonLink
                person={commentView.creator}
                opId={commentView.post.creator_id}
                distinguished={comment.distinguished}
                showBadge={false}
                showTag={false}
              />{" "}
              deleted their <span className="ion-text-nowrap">comment :(</span>
            </DeletedLabel>
            <Spacer />
            {renderAside(comment.updated || comment.published)}
          </>
        );
      case StubType.ModRemoved:
        return (
          <>
            <DeletedLabel>
              mod removed{" "}
              <PersonLink
                person={commentView.creator}
                opId={commentView.post.creator_id}
                distinguished={comment.distinguished}
                showBadge={false}
                showTag={false}
              />
              &apos;s comment
            </DeletedLabel>
            <Spacer />
            {renderAside(comment.updated || comment.published)}
          </>
        );
      default:
        return (
          <>
            <StyledPersonLink
              person={commentView.creator}
              opId={commentView.post.creator_id}
              distinguished={comment.distinguished}
              showBadge={!context}
              showTag={false}
            />
            <UserScore person={commentView.creator} />
            <CommentVote item={commentView} />
            <Edited item={commentView} />
            <Spacer>
              <UserTag person={commentView.creator} />
            </Spacer>
            {renderAside()}
          </>
        );
    }
  })();

  return <Header>{content}</Header>;
}

const StubType = {
  None: 0,
  Deleted: 1,
  ModRemoved: 2,
} as const;

export function isStubComment(
  comment: Comment,
  canModerate: ModeratorRole | undefined,
): (typeof StubType)[keyof typeof StubType] {
  if (comment.deleted) return StubType.Deleted;

  if (comment.removed && !canModerate) return StubType.ModRemoved;

  return StubType.None;
}
