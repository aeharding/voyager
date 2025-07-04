import { IonIcon } from "@ionic/react";
import { link, linkOutline } from "ionicons/icons";
import { MouseEvent, useCallback, useMemo } from "react";
import { PostView } from "threadiverse";

import { useAutohidePostIfNeeded } from "#/features/feed/PageTypeContext";
import { isNsfwBlurred } from "#/features/labels/Nsfw";
import CachedImg from "#/features/media/CachedImg";
import InAppExternalLink from "#/features/shared/InAppExternalLink";
import { cx } from "#/helpers/css";
import { forceSecureUrl } from "#/helpers/url";
import {
  CompactThumbnailSizeType,
  OCompactThumbnailSizeType,
} from "#/services/db/types";
import { useAppDispatch, useAppSelector } from "#/store";

import { setPostRead } from "../../postSlice";
import useIsPostUrlMedia from "../../useIsPostUrlMedia";
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

  const isPostUrlMedia = useIsPostUrlMedia();
  const urlIsMedia = useMemo(
    () => isPostUrlMedia(post),
    [post, isPostUrlMedia],
  );

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

  const isLink = !urlIsMedia && post.post.url;

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
            <CachedImg
              src={forceSecureUrl(post.post.thumbnail_url)}
              pictrsOptions={{
                size: 100,
              }}
              className={cx(styles.img, nsfw && styles.blurImg)}
            />
            <IonIcon className={styles.linkIcon} icon={linkOutline} />
          </>
        );

      return <IonIcon className={styles.fullsizeIcon} icon={link} />;
    }

    if (urlIsMedia) {
      return (
        <CompactFeedPostMedia
          post={post}
          className={cx(styles.img, nsfw && styles.blurImg)}
        />
      );
    }

    return <SelfSvg />;
  }, [isLink, nsfw, post, urlIsMedia]);

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
