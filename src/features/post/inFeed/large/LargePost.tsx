import { use } from "react";

import { PageTypeContext } from "#/features/feed/PageTypeContext";
import CommunityLink from "#/features/labels/links/CommunityLink";
import PersonLink from "#/features/labels/links/PersonLink";
import Nsfw, { isNsfw } from "#/features/labels/Nsfw";
import Save from "#/features/labels/Save";
import ModeratableItem, {
  ModeratableItemBannerOutlet,
} from "#/features/moderation/ModeratableItem";
import ModqueueItemActions from "#/features/moderation/ModqueueItemActions";
import Crosspost from "#/features/post/crosspost/Crosspost";
import AnnouncementIcon from "#/features/post/detail/AnnouncementIcon";
import MoreActions from "#/features/post/shared/MoreActions";
import MoreModActions from "#/features/post/shared/MoreModAction";
import useCrosspostUrl from "#/features/post/shared/useCrosspostUrl";
import { VoteButton } from "#/features/post/shared/VoteButton";
import PostTitleMarkdown from "#/features/shared/markdown/PostTitleMarkdown";
import { cx } from "#/helpers/css";
import { useInModqueue } from "#/routes/pages/shared/ModqueuePage";
import { useAppSelector } from "#/store";

import { PostProps } from "../Post";
import PreviewStats from "../PreviewStats";
import LargePostContents from "./LargePostContents";

import styles from "./LargePost.module.css";

export default function LargePost({ post }: PostProps) {
  const showVotingButtons = useAppSelector(
    (state) => state.settings.appearance.large.showVotingButtons,
  );
  const alwaysShowAuthor = useAppSelector(
    (state) => state.settings.appearance.posts.alwaysShowAuthor,
  );
  const showCommunityAtTop = useAppSelector(
    (state) => state.settings.appearance.posts.communityAtTop,
  );
  const hasBeenRead =
    useAppSelector((state) => state.post.postReadById[post.post.id]) ||
    post.read;

  const crosspostUrl = useCrosspostUrl(post);

  const inModqueue = useInModqueue();

  const inCommunityFeed = use(PageTypeContext) === "community";

  const isAnnouncement =
    post.post.featured_community || post.post.featured_local;

  const hasTopLabelContent = showCommunityAtTop && !inCommunityFeed;

  function renderPostBody() {
    if (crosspostUrl) {
      return <Crosspost post={post} url={crosspostUrl} />;
    }

    return <LargePostContents post={post} />;
  }

  return (
    <ModeratableItem itemView={post}>
      <div className={cx(styles.container, hasBeenRead && styles.read)}>
        <ModeratableItemBannerOutlet />

        <div className={styles.header}>
          {hasTopLabelContent && (
            <div className={styles.details}>
              <div className={styles.leftDetails}>
                <span className={styles.communityName}>
                  {isAnnouncement ? <AnnouncementIcon /> : undefined}
                  <CommunityLink
                    community={post.community}
                    subscribed={post.subscribed}
                    showInstanceWhenRemote
                    tinyIcon
                  />
                </span>
              </div>
            </div>
          )}

          <div className={styles.title}>
            <PostTitleMarkdown>{post.post.name}</PostTitleMarkdown>{" "}
            {isNsfw(post) && <Nsfw />}
          </div>
        </div>

        {renderPostBody()}

        <div className={styles.details}>
          <div className={styles.leftDetails}>
            <span className={styles.communityName}>
              {isAnnouncement && !hasTopLabelContent ? (
                <AnnouncementIcon />
              ) : undefined}
              {inCommunityFeed ? (
                <PersonLink
                  person={post.creator}
                  showInstanceWhenRemote
                  prefix="by"
                  disableInstanceClick
                  sourceUrl={post.post.ap_id}
                />
              ) : (
                <>
                  {!showCommunityAtTop && (
                    <CommunityLink
                      community={post.community}
                      subscribed={post.subscribed}
                      disableInstanceClick
                      showInstanceWhenRemote={
                        !showVotingButtons || !alwaysShowAuthor
                      }
                    />
                  )}
                  {alwaysShowAuthor && (
                    <>
                      {" "}
                      <PersonLink
                        person={post.creator}
                        prefix="by"
                        disableInstanceClick
                        sourceUrl={post.post.ap_id}
                      />
                    </>
                  )}
                </>
              )}
            </span>

            <PreviewStats post={post} />
          </div>
          {(showVotingButtons || inModqueue) && (
            <div className={styles.rightDetails}>
              {inModqueue && <ModqueueItemActions itemView={post} />}
              <MoreActions post={post} />
              {!inModqueue && (
                <>
                  <MoreModActions post={post} />
                  <VoteButton type="up" post={post} />
                  <VoteButton type="down" post={post} />
                </>
              )}
            </div>
          )}
        </div>

        <Save type="post" id={post.post.id} />
      </div>
    </ModeratableItem>
  );
}
