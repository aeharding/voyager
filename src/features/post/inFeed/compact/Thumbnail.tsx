import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { IonIcon } from "@ionic/react";
import { link, linkOutline } from "ionicons/icons";
import { PostView } from "lemmy-js-client";
import { MouseEvent, useCallback, useMemo } from "react";
import { findLoneImage } from "../../../../helpers/markdown";
import { useAppDispatch, useAppSelector } from "../../../../store";
import PostMedia from "../../../gallery/PostMedia";
import { isNsfwBlurred } from "../../../labels/Nsfw";
import SelfSvg from "./self.svg?react";
import { getImageSrc } from "../../../../services/lemmy";
import InAppExternalLink from "../../../shared/InAppExternalLink";
import {
  CompactThumbnailSizeType,
  OCompactThumbnailSizeType,
} from "../../../../services/db";
import { setPostRead } from "../../postSlice";
import { isUrlImage } from "../../../../helpers/url";

function getWidthForSize(size: CompactThumbnailSizeType): number {
  switch (size) {
    case OCompactThumbnailSizeType.Hidden:
      return 0;
    case OCompactThumbnailSizeType.Small:
      return 60;
    case OCompactThumbnailSizeType.Medium:
      return 75;
    case OCompactThumbnailSizeType.Large:
      return 90;
  }
}

const buildContainerCss = (thumbnailSize: CompactThumbnailSizeType) => css`
  display: flex;
  align-items: center;
  justify-content: center;

  flex: 0 0 auto;

  width: ${getWidthForSize(thumbnailSize)}px;
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

const ContainerLink = styled(InAppExternalLink, {
  shouldForwardProp: (prop) => prop !== "thumbnailSize",
})<{
  thumbnailSize: CompactThumbnailSizeType;
}>`
  ${({ thumbnailSize }) => buildContainerCss(thumbnailSize)}
`;

const Container = styled.div<{
  thumbnailSize: CompactThumbnailSizeType;
}>`
  ${({ thumbnailSize }) => buildContainerCss(thumbnailSize)}
`;

const LinkIcon = styled(IonIcon)`
  position: absolute;
  bottom: 3px;
  right: 3px;
  padding: 2px;
  font-size: 14px;
  color: #444;

  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  opacity: 0.9;
`;

const FullsizeIcon = styled(IonIcon)`
  font-size: 2.5em;
  opacity: 0.3;
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

const StyledPostGallery = styled(PostMedia)<{ blur: boolean }>`
  ${({ blur }) => imgStyles(blur)}
`;

const Img = styled.img<{ blur: boolean }>`
  ${({ blur }) => imgStyles(blur)}
`;

interface ImgProps {
  post: PostView;
}

export default function Thumbnail({ post }: ImgProps) {
  const dispatch = useAppDispatch();
  const markdownLoneImage = useMemo(
    () => (post.post.body ? findLoneImage(post.post.body) : undefined),
    [post],
  );

  const postImageSrc = (() => {
    if (post.post.url && isUrlImage(post.post.url)) return post.post.url;

    if (markdownLoneImage) return markdownLoneImage.url;
  })();
  const blurNsfw = useAppSelector(
    (state) => state.settings.appearance.posts.blurNsfw,
  );
  const thumbnailSize = useAppSelector(
    (state) => state.settings.appearance.compact.thumbnailSize,
  );

  const nsfw = useMemo(() => isNsfwBlurred(post, blurNsfw), [post, blurNsfw]);

  const isLink = !postImageSrc && post.post.url;

  const handleLinkClick = (e: MouseEvent) => {
    e.stopPropagation();
    dispatch(setPostRead(post.post.id));
  };

  const renderContents = useCallback(() => {
    if (isLink) {
      return (
        <>
          {post.post.thumbnail_url ? (
            <>
              <Img
                src={getImageSrc(post.post.thumbnail_url, { size: 100 })}
                blur={nsfw}
              />
              <LinkIcon icon={linkOutline} />
            </>
          ) : isLink ? (
            <FullsizeIcon icon={link} />
          ) : (
            <SelfSvg />
          )}
        </>
      );
    }

    if (postImageSrc) {
      return <StyledPostGallery post={post} blur={nsfw} />;
    }

    return <SelfSvg />;
  }, [isLink, nsfw, post, postImageSrc]);

  if (thumbnailSize === OCompactThumbnailSizeType.Hidden) return;

  if (isLink)
    return (
      <ContainerLink
        href={post.post.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleLinkClick}
        thumbnailSize={thumbnailSize}
      >
        {renderContents()}
      </ContainerLink>
    );

  return (
    <Container thumbnailSize={thumbnailSize}>{renderContents()}</Container>
  );
}
