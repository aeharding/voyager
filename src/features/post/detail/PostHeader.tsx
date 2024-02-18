import { IonIcon, IonItem } from "@ionic/react";
import { CommentView, PostView } from "lemmy-js-client";
import { maxWidthCss } from "../../shared/AppContent";
import ModeratableItem, {
  ModeratableItemBannerOutlet,
} from "../../moderation/ModeratableItem";
import { OTapToCollapseType } from "../../../services/db";
import { memo, useCallback, useContext, useMemo, useRef } from "react";
import { PageContext } from "../../auth/PageContext";
import { scrollIntoView } from "../../../helpers/dom";
import { useAppDispatch, useAppSelector } from "../../../store";
import useAppToast from "../../../helpers/useAppToast";
import { findLoneImage } from "../../../helpers/markdown";
import { isUrlMedia } from "../../../helpers/url";
import Markdown from "../../shared/Markdown";
import Embed from "../shared/Embed";
import InlineMarkdown from "../../shared/InlineMarkdown";
import Nsfw, { isNsfw } from "../../labels/Nsfw";
import { megaphone } from "ionicons/icons";
import CommunityLink from "../../labels/links/CommunityLink";
import PersonLink from "../../labels/links/PersonLink";
import Stats from "./Stats";
import Locked from "./Locked";
import PostActions from "../actions/PostActions";
import { postLocked } from "../../../helpers/toastMessages";
import { togglePostCollapse } from "../postSlice";
import Crosspost from "../crosspost/Crosspost";
import useCrosspostUrl from "../shared/useCrosspostUrl";
import Media from "../inFeed/large/media/Media";
import { styled } from "@linaria/react";

const BorderlessIonItem = styled(IonItem)`
  --padding-start: 0;
  --inner-padding-end: 0;

  --inner-border-width: 0 0 1px 0;
  --background: none; // TODO is this OK?

  ${maxWidthCss}
`;

const LightboxMedia = styled(Media)`
  -webkit-touch-callout: default;

  width: 100%;
  object-fit: contain;
  background: var(--lightroom-bg);
`;

const StyledMarkdown = styled(Markdown)`
  margin: 12px 0;

  img {
    display: block;
    max-width: 100%;
    max-height: 50vh;
    object-fit: contain;
    object-position: 0%;
  }
`;

const StyledEmbed = styled(Embed)`
  margin: 12px 0;
`;

const StyledCrosspost = styled(Crosspost)`
  margin: 12px 0;
`;

const Container = styled.div`
  width: 100%;
`;

const PostDeets = styled.div`
  margin: 12px;
  font-size: 0.9375em;

  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const AnnouncementIcon = styled(IonIcon)`
  font-size: 1.1rem;
  margin-right: 5px;
  vertical-align: middle;
  color: var(--ion-color-success);
`;

const Title = styled.div`
  font-size: 1.125rem;
  margin-bottom: 12px;
`;

const By = styled.div`
  font-size: 0.875em;

  margin-bottom: 5px;
  color: var(--ion-color-text-aside);

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface PostHeaderProps {
  post: PostView;
  onPrependComment?: (comment: CommentView) => void;

  // For Share as Image
  showPostActions?: boolean;
  showPostText?: boolean;
  constrainHeight?: boolean;

  className?: string;
}

function PostHeader({
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

  const crosspostUrl = useCrosspostUrl(post);

  const tapToCollapse = useAppSelector(
    (state) => state.settings.general.comments.tapToCollapse,
  );
  const presentToast = useAppToast();

  const scrollTitleIntoView = useCallback(() => {
    if (!titleRef.current) return;

    scrollIntoView(titleRef.current);
  }, []);

  const markdownLoneImage = useMemo(
    () => (post?.post.body ? findLoneImage(post.post.body) : undefined),
    [post],
  );

  const urlIsMedia = useMemo(
    () => post.post.url && isUrlMedia(post.post.url),
    [post],
  );

  const renderMedia = useCallback(() => {
    if (!post) return;

    if (urlIsMedia || markdownLoneImage) {
      return (
        <LightboxMedia
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
      return <StyledCrosspost post={post} url={crosspostUrl} />;
    }

    const usedLoneImage = markdownLoneImage && !urlIsMedia;

    if (post.post.body && !usedLoneImage) {
      return (
        <>
          {post.post.url && !urlIsMedia && <Embed post={post} />}
          <StyledMarkdown>{post.post.body}</StyledMarkdown>
        </>
      );
    }

    if (post.post.url && !urlIsMedia) {
      return <StyledEmbed post={post} />;
    }
  }, [post, crosspostUrl, markdownLoneImage, urlIsMedia]);

  return (
    <ModeratableItem itemView={post}>
      <BorderlessIonItem
        className={className}
        onClick={(e) => {
          if (e.target instanceof HTMLAnchorElement) return;

          if (
            tapToCollapse === OTapToCollapseType.Neither ||
            tapToCollapse === OTapToCollapseType.OnlyComments
          )
            return;

          dispatch(togglePostCollapse(post.post.id));
          scrollTitleIntoView();
        }}
      >
        <Container>
          {showPostText && !crosspostUrl && renderMedia()}
          <PostDeets>
            <ModeratableItemBannerOutlet />
            <div>
              <Title ref={titleRef}>
                <InlineMarkdown>{post.post.name}</InlineMarkdown>{" "}
                {isNsfw(post) && <Nsfw />}
              </Title>
              {!collapsed && showPostText && renderText()}
              <By>
                {post.post.featured_community || post.post.featured_local ? (
                  <AnnouncementIcon icon={megaphone} />
                ) : undefined}
                <CommunityLink
                  community={post.community}
                  showInstanceWhenRemote
                  subscribed={post.subscribed}
                />{" "}
                <PersonLink person={post.creator} prefix="by" />
              </By>
              <Stats post={post} />
              {post.post.locked && <Locked />}
            </div>
          </PostDeets>
        </Container>
      </BorderlessIonItem>
      {showPostActions && (
        <BorderlessIonItem>
          <PostActions
            post={post}
            onReply={async () => {
              if (presentLoginIfNeeded()) return;
              if (post.post.locked) {
                presentToast(postLocked);
                return;
              }

              const reply = await presentCommentReply(post);

              if (reply) onPrependComment?.(reply);
            }}
          />
        </BorderlessIonItem>
      )}
    </ModeratableItem>
  );
}

export default memo(PostHeader);
