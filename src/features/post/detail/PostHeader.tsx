import { IonItem } from "@ionic/react";
import { CommentView, PostView } from "lemmy-js-client";
import { useCallback, useContext, useMemo, useRef } from "react";
import AnimateHeight from "react-animate-height";

import { AppContext } from "#/features/auth/AppContext";
import { PageContext } from "#/features/auth/PageContext";
import CommunityLink from "#/features/labels/links/CommunityLink";
import PersonLink from "#/features/labels/links/PersonLink";
import Nsfw, { isNsfw } from "#/features/labels/Nsfw";
import ModeratableItem, {
  ModeratableItemBannerOutlet,
} from "#/features/moderation/ModeratableItem";
import { getCanModerate } from "#/features/moderation/useCanModerate";
import PostActions from "#/features/post/actions/PostActions";
import Crosspost from "#/features/post/crosspost/Crosspost";
import LargeFeedPostMedia from "#/features/post/inFeed/large/media/LargeFeedPostMedia";
import PostLink from "#/features/post/link/PostLink";
import { togglePostCollapse } from "#/features/post/postSlice";
import useCrosspostUrl from "#/features/post/shared/useCrosspostUrl";
import useIsPostUrlMedia from "#/features/post/useIsPostUrlMedia";
import InlineMarkdown from "#/features/shared/markdown/InlineMarkdown";
import Markdown from "#/features/shared/markdown/Markdown";
import { cx } from "#/helpers/css";
import { findIonContentScrollView } from "#/helpers/ionic";
import { findLoneImage } from "#/helpers/markdown";
import { postLocked } from "#/helpers/toastMessages";
import useAppToast from "#/helpers/useAppToast";
import { OTapToCollapseType } from "#/services/db";
import { useAppDispatch, useAppSelector } from "#/store";

import AnnouncementIcon from "./AnnouncementIcon";
import Locked from "./Locked";
import Stats from "./Stats";

import styles from "./PostHeader.module.css";

interface PostHeaderProps {
  post: PostView;
  onPrependComment?: (comment: CommentView) => void;

  // For Share as Image
  showPostActions?: boolean;
  showPostText?: boolean;
  constrainHeight?: boolean;

  className?: string;
}

export default function PostHeader({
  post,
  onPrependComment,
  showPostActions = true,
  showPostText = true,
  constrainHeight = true,
  className,
}: PostHeaderProps) {
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector(
    (state) => !!state.post.postCollapsedById[post.post.id],
  );
  const titleRef = useRef<HTMLDivElement>(null);
  const { presentLoginIfNeeded, presentCommentReply } = useContext(PageContext);
  const { activePageRef } = useContext(AppContext);

  const crosspostUrl = useCrosspostUrl(post);

  const tapToCollapse = useAppSelector(
    (state) => state.settings.general.comments.tapToCollapse,
  );
  const presentToast = useAppToast();

  const markdownLoneImage = useMemo(
    () => (post?.post.body ? findLoneImage(post.post.body) : undefined),
    [post],
  );

  const isPostUrlMedia = useIsPostUrlMedia();
  const urlIsMedia = useMemo(
    () => isPostUrlMedia(post),
    [post, isPostUrlMedia],
  );

  function scrollToTitle() {
    const titleTop = (() => {
      const top = titleRef.current?.offsetTop;
      if (!top) return 0;

      if (top - 12 === 0) return 0;
      return top - 12 + 1; // extra 1 to prevent thin line of image showing
    })();

    if (activePageRef?.current?.current) {
      if ("querySelector" in activePageRef.current.current) {
        findIonContentScrollView(activePageRef.current.current)?.scrollTo({
          top: titleTop,
          behavior: "smooth",
        });
      } else {
        activePageRef.current.current.scrollToIndex(0, {
          smooth: true,
          offset: titleTop,
        });
      }
    }
  }

  const renderMedia = useCallback(() => {
    if (!post) return;

    if (urlIsMedia || markdownLoneImage) {
      return (
        <LargeFeedPostMedia
          className={styles.lightboxMedia}
          blur={false}
          post={post}
          nativeControls
          onClick={(e) => {
            e.preventDefault(); // prevent OutPortalEventDispatcher dispatch
          }}
          style={constrainHeight ? { maxHeight: "50vh" } : undefined}
        />
      );
    }
  }, [post, urlIsMedia, markdownLoneImage, constrainHeight]);

  const renderText = useCallback(() => {
    if (!post) return;

    if (crosspostUrl) {
      return (
        <Crosspost
          className={styles.crosspost}
          post={post}
          url={crosspostUrl}
        />
      );
    }

    const usedLoneImage = markdownLoneImage && !urlIsMedia;

    if (post.post.body?.trim() && !usedLoneImage) {
      return (
        <>
          {post.post.url && !urlIsMedia && <PostLink post={post} />}
          <Markdown
            className={cx(styles.markdown, "collapse-md-margins")}
            id={post.post.ap_id}
          >
            {post.post.body}
          </Markdown>
        </>
      );
    }

    if (post.post.url && !urlIsMedia) {
      return <PostLink className={styles.postLink} post={post} />;
    }
  }, [post, crosspostUrl, markdownLoneImage, urlIsMedia]);

  const text = renderText();

  return (
    <ModeratableItem itemView={post}>
      <IonItem
        className={cx(styles.borderlessIonItem, className)}
        onClick={(e) => {
          if (e.target instanceof HTMLAnchorElement) return;

          if (
            tapToCollapse === OTapToCollapseType.Neither ||
            tapToCollapse === OTapToCollapseType.OnlyComments
          )
            return;

          dispatch(togglePostCollapse(post.post.id));
          scrollToTitle();
        }}
      >
        <div className={styles.container}>
          {showPostText && !crosspostUrl && renderMedia()}
          <div className={styles.postDeets}>
            <ModeratableItemBannerOutlet />
            <div>
              <div className={styles.title} ref={titleRef}>
                <InlineMarkdown>{post.post.name}</InlineMarkdown>{" "}
                {isNsfw(post) && <Nsfw />}
              </div>
              {showPostText && text && (
                <AnimateHeight duration={200} height={collapsed ? 0 : "auto"}>
                  <div className={styles.textContent} slot="content">
                    {text}
                  </div>
                </AnimateHeight>
              )}
              <div className={styles.by}>
                {post.post.featured_community || post.post.featured_local ? (
                  <AnnouncementIcon />
                ) : undefined}
                <CommunityLink
                  community={post.community}
                  showInstanceWhenRemote
                  subscribed={post.subscribed}
                />{" "}
                <PersonLink
                  person={post.creator}
                  prefix="by"
                  sourceUrl={post.post.ap_id}
                />
              </div>
              <Stats post={post} />
              {post.post.locked && <Locked />}
            </div>
          </div>
        </div>
      </IonItem>
      {showPostActions && (
        <IonItem className={styles.borderlessIonItem}>
          <PostActions
            post={post}
            onReply={async () => {
              if (presentLoginIfNeeded()) return;

              const canModerate = getCanModerate(post.community);

              if (post.post.locked && !canModerate) {
                presentToast(postLocked);
                return;
              }

              const reply = await presentCommentReply(post);

              if (reply) onPrependComment?.(reply);
            }}
          />
        </IonItem>
      )}
    </ModeratableItem>
  );
}
