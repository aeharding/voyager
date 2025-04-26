import { IonIcon } from "@ionic/react";
import { chevronDownOutline } from "ionicons/icons";
import { Comment, CommentView } from "lemmy-js-client";
import { RefObject } from "react";

import Ago from "#/features/labels/Ago";
import Edited from "#/features/labels/Edited";
import PersonLink from "#/features/labels/links/PersonLink";
import Vote from "#/features/labels/vote/Vote";
import ModqueueItemActions from "#/features/moderation/ModqueueItemActions";
import { ModeratorRole } from "#/features/moderation/useCanModerate";
import { ActionButton } from "#/features/post/actions/ActionButton";
import ActionsContainer from "#/features/post/actions/ActionsContainer";
import UserScore from "#/features/tags/UserScore";
import UserTag from "#/features/tags/UserTag";
import { cx } from "#/helpers/css";
import { getCounts } from "#/helpers/lemmyCompat";
import { useInModqueue } from "#/routes/pages/shared/ModqueuePage";
import { useAppSelector } from "#/store";

import CommentEllipsis, { CommentEllipsisHandle } from "./CommentEllipsis";
import ModActions from "./ModActions";

import styles from "./CommentHeader.module.css";

const MAX_TAG_LENGTH_WITHOUT_CUTOFF = 6;

interface CommentHeaderProps {
  canModerate: ModeratorRole | undefined;
  commentView: CommentView;
  comment: Comment;
  context: React.ReactNode;
  collapsed: boolean | undefined;
  rootIndex: number | undefined;
  commentEllipsisHandleRef: RefObject<CommentEllipsisHandle | undefined>;
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
  const tagsEnabled = useAppSelector((state) => state.settings.tags.enabled);
  const trackVotesEnabled = useAppSelector(
    (state) => state.settings.tags.trackVotes,
  );

  const accommodateLargeText = useAppSelector(
    (state) => state.settings.appearance.font.accommodateLargeText,
  );

  function renderActions() {
    if (inModqueue) return <ModqueueItemActions itemView={commentView} />;

    if (canModerate)
      return <ModActions comment={commentView} role={canModerate} />;
  }

  const stub = isStubComment(comment, canModerate);

  function renderAside(agoTimestamp: string) {
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
            <div className={styles.amountCollapsed}>
              {getCounts(commentView).child_count +
                (showCollapsedComment || stub ? 0 : 1)}
            </div>
            <IonIcon
              className={styles.collapsedIcon}
              icon={chevronDownOutline}
            />
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
            <div className={styles.deletedLabel}>
              <PersonLink
                person={commentView.creator}
                opId={commentView.post.creator_id}
                distinguished={comment.distinguished}
                showBadge={false}
                showTag={false}
                sourceUrl={commentView.comment.ap_id}
              />{" "}
              deleted their <span className="ion-text-nowrap">comment :(</span>
            </div>
            <div className={styles.spacer} />
            {renderAside(comment.updated || comment.published)}
          </>
        );
      case StubType.ModRemoved:
        return (
          <>
            <div className={styles.deletedLabel}>
              mod removed{" "}
              <PersonLink
                person={commentView.creator}
                opId={commentView.post.creator_id}
                distinguished={comment.distinguished}
                showBadge={false}
                showTag={false}
                sourceUrl={commentView.comment.ap_id}
              />
              &apos;s comment
            </div>
            <div className={styles.spacer} />
            {renderAside(comment.updated || comment.published)}
          </>
        );
      default:
        if (accommodateLargeText) {
          return (
            <div className={styles.divContainerLarge}>
              <div className={styles.divChildLarge}>
                <PersonLink
                  className={styles.personLink}
                  person={commentView.creator}
                  opId={commentView.post.creator_id}
                  distinguished={comment.distinguished}
                  showBadge={!context}
                  showTag={false}
                  sourceUrl={commentView.comment.ap_id}
                />
                {tagsEnabled && trackVotesEnabled && (
                  <UserScore person={commentView.creator} />
                )}
              </div>

              <div className={styles.divChildLarge}>
                <Vote
                  className={styles.commentVote}
                  item={commentView}
                  spacer={true}
                />
                <Edited item={commentView} />
                <div className={styles.spacer}>
                  {tagsEnabled && <UserTag person={commentView.creator} />}
                </div>

                {renderAside(comment.published)}
              </div>
            </div>
          );
        }

        return (
          <>
            <PersonLink
              className={styles.personLink}
              person={commentView.creator}
              opId={commentView.post.creator_id}
              distinguished={comment.distinguished}
              showBadge={!context}
              showTag={false}
              sourceUrl={commentView.comment.ap_id}
            />
            {tagsEnabled && trackVotesEnabled && (
              <UserScore person={commentView.creator} />
            )}

            <Vote className={styles.commentVote} item={commentView} />
            <Edited item={commentView} />
            {tagsEnabled ? (
              <UserTag person={commentView.creator}>
                {(props) =>
                  props ? (
                    <div
                      className={cx(
                        styles.spacer,
                        styles.spacerWithTag,
                        (props.tag.text?.length || 0) <
                          MAX_TAG_LENGTH_WITHOUT_CUTOFF &&
                          styles.noShrinkSpacer,
                      )}
                    >
                      {props.el}
                    </div>
                  ) : (
                    <div className={styles.spacer} />
                  )
                }
              </UserTag>
            ) : (
              <div className={styles.spacer} />
            )}
            {renderAside(comment.published)}
          </>
        );
    }
  })();

  return <div className={styles.header}>{content}</div>;
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
