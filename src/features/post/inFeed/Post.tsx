import styled from "@emotion/styled";
import { IonItem } from "@ionic/react";
import { PostView } from "lemmy-js-client";
import { megaphone } from "ionicons/icons";
import PreviewStats from "./PreviewStats";
import Embed from "../shared/Embed";
import { useEffect, useMemo, useState } from "react";
import { css } from "@emotion/react";
import { findLoneImage } from "../../../helpers/markdown";
import { getHandle, isUrlImage, isUrlVideo } from "../../../helpers/lemmy";
import { maxWidthCss } from "../../shared/AppContent";
import Nsfw, { isNsfw } from "../../labels/Nsfw";
import { VoteButton } from "../shared/VoteButton";
import SlidingVote from "../../shared/sliding/SlidingVote";
import MoreActions from "../shared/MoreActions";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import PersonLink from "../../labels/links/PersonLink";
import InlineMarkdown from "../../shared/InlineMarkdown";
import { AnnouncementIcon } from "../detail/PostDetail";
import CommunityLink from "../../labels/links/CommunityLink";
import Video from "../../shared/Video";

const CustomIonItem = styled(IonItem)`
  --padding-start: 0;
  --inner-padding-end: 0;

  --border-width: 0;
  --border-style: none;
  --background-hover: none;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 0.75rem;
  padding: 0.75rem;

  ${maxWidthCss}
`;

const Details = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  font-size: 0.8em;
  color: var(--ion-color-medium);
`;

const LeftDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const RightDetails = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.5rem;

  > * {
    padding: 0.5rem;
  }
`;

const CommunityName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PostBody = styled.div`
  font-size: 0.8em !important;
  line-height: 1.3;
  opacity: 0.5;

  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ImageContainer = styled.div`
  overflow: hidden;
  margin: 0 -1rem;
`;

const PostImage = styled.img<{ blur: boolean }>`
  width: 100%;
  max-width: none;

  ${({ blur }) =>
    blur &&
    css`
      filter: blur(40px);
    `}
`;

interface PostProps {
  post: PostView;

  /**
   * Hide the community name, show author name
   */
  communityMode?: boolean;

  className?: string;
}

export default function Post({ post, communityMode, className }: PostProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const markdownLoneImage = useMemo(
    () => (post.post.body ? findLoneImage(post.post.body) : undefined),
    [post]
  );
  const [blur, setBlur] = useState(isNsfw(post));

  useEffect(() => {
    setBlur(isNsfw(post));
  }, [post]);

  function renderPostBody() {
    if (post.post.url) {
      if (isUrlImage(post.post.url)) {
        return (
          <ImageContainer>
            <PostImage
              src={post.post.url}
              draggable="false"
              blur={blur}
              onClick={(e) => {
                if (isNsfw(post)) {
                  e.stopPropagation();
                  setBlur(!blur);
                }
              }}
            />
          </ImageContainer>
        );
      }
      if (isUrlVideo(post.post.url)) {
        return (
          <ImageContainer>
            <Video src={post.post.url} />
          </ImageContainer>
        );
      }
    }

    if (markdownLoneImage)
      return (
        <ImageContainer>
          <PostImage
            src={markdownLoneImage.url}
            alt={markdownLoneImage.altText}
            blur={blur}
            onClick={(e) => {
              if (isNsfw(post)) {
                e.stopPropagation();
                setBlur(!blur);
              }
            }}
          />
        </ImageContainer>
      );

    if (post.post.thumbnail_url && post.post.url) {
      return <Embed post={post} />;
    }

    if (post.post.body) {
      return (
        <>
          {post.post.url && <Embed post={post} />}

          <PostBody>
            <InlineMarkdown>{post.post.body}</InlineMarkdown>
          </PostBody>
        </>
      );
    }

    if (post.post.url) {
      return <Embed post={post} />;
    }
  }

  return (
    <SlidingVote item={post} className={className}>
      {/* href=undefined: Prevent drag failure on firefox */}
      <CustomIonItem
        detail={false}
        routerLink={buildGeneralBrowseLink(
          `/c/${getHandle(post.community)}/comments/${post.post.id}`
        )}
        href={undefined}
      >
        <Container>
          <div>
            <InlineMarkdown>{post.post.name}</InlineMarkdown>{" "}
            {isNsfw(post) && <Nsfw />}
          </div>

          {renderPostBody()}

          <Details>
            <LeftDetails>
              <CommunityName>
                {post.counts.featured_community ||
                post.counts.featured_local ? (
                  <AnnouncementIcon icon={megaphone} />
                ) : undefined}
                {communityMode ? (
                  <PersonLink
                    person={post.creator}
                    showInstanceWhenRemote
                    prefix="by"
                  />
                ) : (
                  <CommunityLink
                    community={post.community}
                    showInstanceWhenRemote
                  />
                )}
              </CommunityName>

              <PreviewStats
                stats={post.counts}
                voteFromServer={post.my_vote}
                published={post.post.published}
              />
            </LeftDetails>
            <RightDetails onClick={(e) => e.stopPropagation()}>
              <MoreActions post={post} />
              <VoteButton type="up" postId={post.post.id} />
              <VoteButton type="down" postId={post.post.id} />
            </RightDetails>
          </Details>
        </Container>
      </CustomIonItem>
    </SlidingVote>
  );
}
