import { IonIcon } from "@ionic/react";
import { link, linkOutline } from "ionicons/icons";
import { PostView } from "lemmy-js-client";
import { MouseEvent, useCallback, useMemo } from "react";
import { findLoneImage } from "../../../../helpers/markdown";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { isNsfwBlurred } from "../../../labels/Nsfw";
import SelfSvg from "./self.svg?react";
import { getImageSrc } from "../../../../services/lemmy";
import InAppExternalLink from "../../../shared/InAppExternalLink";
import {
  CompactThumbnailSizeType,
  OCompactThumbnailSizeType,
} from "../../../../services/db";
import { isUrlImage } from "../../../../helpers/url";
import { useAutohidePostIfNeeded } from "../../../feed/PageTypeContext";
import { setPostRead } from "../../postSlice";
import { css, cx } from "@linaria/core";
import { styled } from "@linaria/react";
import CompactFeedPostMedia from "./CompactFeedPostMedia";

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

const sharedContainerCss = css`
  display: flex;
  align-items: center;
  justify-content: center;

  flex: 0 0 auto;

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

const imgCss = css`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const blurImgCss = css`
  filter: blur(6px);

  // https://graffino.com/til/CjT2jrcLHP-how-to-fix-filter-blur-performance-issue-in-safari
  transform: translate3d(0, 0, 0);
`;

interface ImgProps {
  post: PostView;
}

export default function Thumbnail({ post }: ImgProps) {
  const dispatch = useAppDispatch();
  const autohidePostIfNeeded = useAutohidePostIfNeeded();
  const markdownLoneImage = useMemo(
    () => (post.post.body ? findLoneImage(post.post.body) : undefined),
    [post],
  );

  const postImageSrc = useMemo(() => {
    if (post.post.url && isUrlImage(post.post.url)) return post.post.url;

    if (markdownLoneImage) return markdownLoneImage.url;
  }, [markdownLoneImage, post.post.url]);

  const blurNsfw = useAppSelector(
    (state) => state.settings.appearance.posts.blurNsfw,
  );
  const thumbnailSize = useAppSelector(
    (state) => state.settings.appearance.compact.thumbnailSize,
  );
  const showSelfPostThumbnails = useAppSelector(
    (state) => state.settings.appearance.compact.showSelfPostThumbnails,
  );

  const nsfw = useMemo(() => isNsfwBlurred(post, blurNsfw), [post, blurNsfw]);

  const isLink = !postImageSrc && post.post.url;

  const handleLinkClick = (e: MouseEvent) => {
    e.stopPropagation();

    dispatch(setPostRead(post.post.id));
    autohidePostIfNeeded(post);
  };

  const renderContents = useCallback(() => {
    if (isLink) {
      return (
        <>
          {post.post.thumbnail_url ? (
            <>
              <img
                src={getImageSrc(post.post.thumbnail_url, { size: 100 })}
                className={cx(imgCss, nsfw && blurImgCss)}
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
      return (
        <CompactFeedPostMedia
          post={post}
          className={cx(imgCss, nsfw && blurImgCss)}
        />
      );
    }

    return <SelfSvg />;
  }, [isLink, nsfw, post, postImageSrc]);

  if (thumbnailSize === OCompactThumbnailSizeType.Hidden) return;

  const contents = renderContents();

  if (!showSelfPostThumbnails && contents.type === SelfSvg) return;

  const style = { width: getWidthForSize(thumbnailSize) };

  if (isLink)
    return (
      <InAppExternalLink
        href={post.post.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleLinkClick}
        className={sharedContainerCss}
        style={style}
      >
        {contents}
      </InAppExternalLink>
    );

  return (
    <div className={sharedContainerCss} style={style}>
      {contents}
    </div>
  );
}
