import { useContext } from "react";

import { PageTypeContext } from "#/features/feed/PageTypeContext";
import CommunityLink from "#/features/labels/links/CommunityLink";
import PersonLink from "#/features/labels/links/PersonLink";
import Nsfw, { isNsfw } from "#/features/labels/Nsfw";
import Save from "#/features/labels/Save";
import ModeratableItem, {
  ModeratableItemBannerOutlet,
} from "#/features/moderation/ModeratableItem";
import ModqueueItemActions from "#/features/moderation/ModqueueItemActions";
import ActionsContainer from "#/features/post/actions/ActionsContainer";
import CompactCrosspost from "#/features/post/crosspost/CompactCrosspost";
import AnnouncementIcon from "#/features/post/detail/AnnouncementIcon";
import MoreActions from "#/features/post/shared/MoreActions";
import MoreModActions from "#/features/post/shared/MoreModAction";
import useCrosspostUrl from "#/features/post/shared/useCrosspostUrl";
import { VoteButton } from "#/features/post/shared/VoteButton";
import InlineMarkdown from "#/features/shared/markdown/InlineMarkdown";
import { cx, sv } from "#/helpers/css";
import { isUrlImage, parseUrlForDisplay } from "#/helpers/url";
import { useInModqueue } from "#/routes/pages/shared/ModqueuePage";
import { useAppSelector } from "#/store";

import { PostProps } from "../Post";
import PreviewStats from "../PreviewStats";
import Thumbnail from "./Thumbnail";

import styles from "./CompactPost.module.css";

export default function CompactPost({ post }: PostProps) {
  const alwaysShowAuthor = useAppSelector(
    (state) => state.settings.appearance.posts.alwaysShowAuthor,
  );
  const compactThumbnailPositionType = useAppSelector(
    (state) => state.settings.appearance.compact.thumbnailsPosition,
  );
  const compactShowVotingButtons = useAppSelector(
    (state) => state.settings.appearance.compact.showVotingButtons,
  );
  const showCommunityAtTop = useAppSelector(
    (state) => state.settings.appearance.posts.communityAtTop,
  );

  const crosspostUrl = useCrosspostUrl(post);

  const inModqueue = useInModqueue();

  const inCommunityFeed = useContext(PageTypeContext) === "community";

  const hasBeenRead: boolean =
    useAppSelector((state) => state.post.postReadById[post.post.id]) ||
    post.read;

  const [domain] =
    post.post.url && !isUrlImage(post.post.url, post.post.url_content_type)
      ? parseUrlForDisplay(post.post.url)
      : [];

  return (
    <ModeratableItem itemView={post}>
      <div className={cx(styles.container, hasBeenRead && styles.read)}>
        <ModeratableItemBannerOutlet />

        <div className={styles.contents}>
          {compactThumbnailPositionType === "left" && <Thumbnail post={post} />}
          <div className={styles.content}>
            {(inModqueue || showCommunityAtTop) && !inCommunityFeed && (
              <div className={styles.aside} style={sv({ color: "inherit" })}>
                <CommunityLink
                  community={post.community}
                  subscribed={post.subscribed}
                  showInstanceWhenRemote
                  tinyIcon
                />
              </div>
            )}
            <span className={styles.title}>
              <InlineMarkdown>{post.post.name}</InlineMarkdown>{" "}
              {domain && (
                <>
                  <span className={styles.domain}>
                    (<span>{domain}</span>)
                  </span>{" "}
                </>
              )}
              {isNsfw(post) && <Nsfw />}
            </span>
            <div className={styles.aside}>
              <div className={styles.from}>
                {post.post.featured_community || post.post.featured_local ? (
                  <AnnouncementIcon />
                ) : undefined}
                {inCommunityFeed || inModqueue ? (
                  <PersonLink
                    person={post.creator}
                    showInstanceWhenRemote
                    prefix="by"
                    sourceUrl={post.post.ap_id}
                  />
                ) : (
                  <>
                    {!showCommunityAtTop && (
                      <CommunityLink
                        community={post.community}
                        subscribed={post.subscribed}
                        tinyIcon
                      />
                    )}
                    {alwaysShowAuthor && (
                      <>
                        {" "}
                        <PersonLink
                          person={post.creator}
                          prefix="by"
                          sourceUrl={post.post.ap_id}
                        />
                      </>
                    )}
                  </>
                )}
              </div>
              <ActionsContainer>
                <PreviewStats post={post} />
                {inModqueue ? (
                  <ModqueueItemActions itemView={post} />
                ) : (
                  <MoreModActions
                    className={styles.styledModActions}
                    post={post}
                    solidIcon
                  />
                )}
                <MoreActions className={styles.styledMoreActions} post={post} />
              </ActionsContainer>
            </div>
            {crosspostUrl && (
              <div>
                <CompactCrosspost post={post} url={crosspostUrl} />
              </div>
            )}
          </div>
          {compactThumbnailPositionType === "right" && (
            <Thumbnail post={post} />
          )}
          {compactShowVotingButtons === true && (
            <div className={styles.endDetails}>
              <VoteButton type="up" post={post} />
              <VoteButton type="down" post={post} />
            </div>
          )}
          <Save type="post" id={post.post.id} />
        </div>
      </div>
    </ModeratableItem>
  );
}
