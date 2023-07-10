import styled from "@emotion/styled";
import { ReactComponent as SelfSvg } from "./self.svg";
import { PostView } from "lemmy-js-client";
import { isUrlImage } from "../../../../helpers/lemmy";
import { useCallback, useMemo } from "react";
import { findLoneImage } from "../../../../helpers/markdown";
import { css } from "@emotion/react";
import { isNsfw } from "../../../labels/Nsfw";
import { globeOutline } from "ionicons/icons";
import { IonIcon } from "@ionic/react";
import PostGalleryImg from "../../../gallery/PostGalleryImg";

const containerCss = css`
  display: flex;
  align-items: center;
  justify-content: center;

  flex: 0 0 auto;

  width: max(11%, 60px);
  aspect-ratio: 1;
  background: var(--ion-color-light);
  border-radius: 8px;

  position: relative;

  overflow: hidden;
  color: inherit;

  svg {
    width: 60%;
    opacity: 0.5;
  }
`;

const ContainerLink = styled.a`
  ${containerCss}
`;

const Container = styled.div`
  ${containerCss}
`;

const LinkIcon = styled(IonIcon)<{ bg: boolean }>`
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 4px;
  font-size: 0.875em;

  opacity: 0.5;
  border-top-left-radius: 8px;

  ${({ bg }) =>
    bg &&
    css`
      background: rgba(0, 0, 0, 0.4);
    `}
`;

const imgStyles = (blur: boolean) => css`
  width: 100%;
  height: 100%;
  object-fit: cover;

  ${blur &&
  css`
    filter: blur(6px);

    // https://graffino.com/til/CjT2jrcLHP-how-to-fix-filter-blur-performance-issue-in-safari
    transform: translate3d(0, 0, 0);
  `}
`;

const StyledPostGallery = styled(PostGalleryImg)<{ blur: boolean }>`
  ${({ blur }) => imgStyles(blur)}
`;

const Img = styled.img<{ blur: boolean }>`
  ${({ blur }) => imgStyles(blur)}
`;

interface ImgProps {
  post: PostView;
}

export default function Thumbnail({ post }: ImgProps) {
  const markdownLoneImage = useMemo(
    () => (post.post.body ? findLoneImage(post.post.body) : undefined),
    [post]
  );

  const postImageSrc = (() => {
    if (post.post.url && isUrlImage(post.post.url)) return post.post.url;

    if (markdownLoneImage) return markdownLoneImage.url;
  })();

  const nsfw = useMemo(() => isNsfw(post), [post]);

  const isLink = !postImageSrc && post.post.url;

  const renderContents = useCallback(() => {
    if (isLink) {
      return (
        <>
          {post.post.thumbnail_url ? (
            <Img src={post.post.thumbnail_url} blur={nsfw} />
          ) : (
            <SelfSvg />
          )}
          <LinkIcon icon={globeOutline} bg={!!post.post.thumbnail_url} />
        </>
      );
    }

    if (postImageSrc) {
      return <StyledPostGallery post={post} blur={nsfw} />;
    }

    return <SelfSvg />;
  }, [isLink, nsfw, post, postImageSrc]);

  if (isLink)
    return (
      <ContainerLink
        href={post.post.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
      >
        {renderContents()}
      </ContainerLink>
    );

  return <Container>{renderContents()}</Container>;
}
