import { IonIcon } from "@ionic/react";
import { link, linkOutline } from "ionicons/icons";
import { PostView } from "lemmy-js-client";
import { MouseEvent, useCallback, useMemo } from "react";

import { useAutohidePostIfNeeded } from "#/features/feed/PageTypeContext";
import { isNsfwBlurred } from "#/features/labels/Nsfw";
import InAppExternalLink from "#/features/shared/InAppExternalLink";
import { cx } from "#/helpers/css";
import { findLoneImage } from "#/helpers/markdown";
import { isUrlImage } from "#/helpers/url";
import {
  CompactThumbnailSizeType,
  OCompactThumbnailSizeType,
} from "#/services/db";
import { getImageSrc } from "#/services/lemmy";
import { useAppDispatch, useAppSelector } from "#/store";

import { setPostRead } from "../../postSlice";
import CompactFeedPostMedia from "./CompactFeedPostMedia";
import SelfSvg from "./self.svg?react";

import styles from "./Thumbnail.module.css";

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
    if (post.post.url && isUrlImage(post.post.url, post.post.url_content_type))
      return post.post.url;

    if (markdownLoneImage) return markdownLoneImage.url;
  }, [markdownLoneImage, post.post]);

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
      if (post.post.thumbnail_url)
        return (
          <>
            <img
              src={getImageSrc(post.post.thumbnail_url, { size: 100 })}
              className={cx(styles.img, nsfw && styles.blurImg)}
            />
            <IonIcon className={styles.linkIcon} icon={linkOutline} />
          </>
        );

      return <IonIcon className={styles.fullsizeIcon} icon={link} />;
    }

    if (postImageSrc) {
      return (
        <CompactFeedPostMedia
          post={post}
          className={cx(styles.img, nsfw && styles.blurImg)}
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
        className={styles.container}
        style={style}
      >
        {contents}
      </InAppExternalLink>
    );

  return (
    <div className={styles.container} style={style}>
      {contents}
    </div>
  );
}
