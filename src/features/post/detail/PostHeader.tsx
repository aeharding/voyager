import { IonItem } from "@ionic/react";
import { use, useCallback, useMemo, useRef } from "react";
import AnimateHeight from "react-animate-height";
import { CommentView, PostView } from "threadiverse";

import { SharedDialogContext } from "#/features/auth/SharedDialogContext";
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
import Markdown from "#/features/shared/markdown/Markdown";
import PostTitleMarkdown from "#/features/shared/markdown/PostTitleMarkdown";
import { cx } from "#/helpers/css";
import { findIonContentScrollView } from "#/helpers/ionic";
import { postLocked } from "#/helpers/toastMessages";
import useAppToast from "#/helpers/useAppToast";
import useGetAppScrollable from "#/helpers/useGetAppScrollable";
import { OTapToCollapseType } from "#/services/db/types";
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
  const { presentLoginIfNeeded, presentCommentReply } =
    use(SharedDialogContext);
  const getAppScrollable = useGetAppScrollable();

  const crosspostUrl = useCrosspostUrl(post);

  const tapToCollapse = useAppSelector(
    (state) => state.settings.general.comments.tapToCollapse,
  );
  const presentToast = useAppToast();

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

    const appScrollable = getAppScrollable();

    if (!appScrollable) return;

    if ("querySelector" in appScrollable) {
      findIonContentScrollView(appScrollable)?.scrollTo({
        top: titleTop,
        behavior: "smooth",
      });
    } else {
      appScrollable.scrollToIndex(0, {
        smooth: true,
        offset: titleTop,
      });
    }
  }

  const renderMedia = useCallback(() => {
    if (!post) return;

    if (urlIsMedia) {
      return (
        <LargeFeedPostMedia
          className={styles.lightboxMedia}
          blur={false}
          post={post}
          onClick={(e) => {
            e.preventDefault(); // prevent OutPortalEventDispatcher dispatch
          }}
          style={constrainHeight ? { maxHeight: "50vh" } : undefined}
        />
      );
    }
  }, [post, urlIsMedia, constrainHeight]);

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

    if (post.post.body?.trim() && urlIsMedia !== "from-body") {
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
  }, [post, crosspostUrl, urlIsMedia]);

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
                <PostTitleMarkdown>{post.post.name}</PostTitleMarkdown>{" "}
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
