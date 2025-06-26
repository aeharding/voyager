import { IonIcon } from "@ionic/react";
import { chevronForward } from "ionicons/icons";
import { MouseEvent, useEffect, useState } from "react";

import { LinkData } from "#/features/comment/CommentLinks";
import CachedImg from "#/features/media/CachedImg";
import LinkInterceptor from "#/features/shared/markdown/LinkInterceptor";
import PostTitleMarkdown from "#/features/shared/markdown/PostTitleMarkdown";
import Url from "#/features/shared/Url";
import useLemmyUrlHandler from "#/features/shared/useLemmyUrlHandler";
import { cx } from "#/helpers/css";
import { preventOnClickNavigationBug } from "#/helpers/ionic";
import {
  determineTypeFromUrl,
  forceSecureUrl,
  isUrlImage,
} from "#/helpers/url";
import { useAppDispatch, useAppSelector } from "#/store";

import LinkPreview from "./LinkPreview";
import { fetchThumbnail } from "./thumbnail/thumbnailSlice";

import styles from "./Link.module.css";

const TRANSPARENT_PIXEL =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';

interface EmbedProps {
  url: string;
  thumbnail?: string;
  text?: string;

  /**
   * @default true
   */
  compact?: boolean;

  small?: boolean;

  blur?: boolean;
  className?: string;

  onClick?: (e: MouseEvent) => void;
  onClickCompleted?: () => void;

  commentType?: LinkData["type"];
}

export default function Link({
  url,
  text,
  thumbnail: lemmyThubmnail,
  compact = true,
  blur,
  className,
  onClick,
  onClickCompleted,
  small,
  commentType,
}: EmbedProps) {
  const dispatch = useAppDispatch();
  const { determineObjectTypeFromUrl } = useLemmyUrlHandler();
  const thumbnailinatorEnabled = useAppSelector(
    (state) => state.settings.general.thumbnailinatorEnabled,
  );
  const thumbnailinatorResult = useAppSelector(
    (state) => state.thumbnail.thumbnailSrcByUrl[url],
  );

  const [error, setError] = useState(false);

  const linkType = determineObjectTypeFromUrl(url) ?? determineTypeFromUrl(url);

  function handleLinkClick(e: MouseEvent) {
    e.stopPropagation();

    if (preventOnClickNavigationBug(e)) return;

    onClick?.(e);
  }

  const thumbnail = (() => {
    if (lemmyThubmnail) return lemmyThubmnail;

    if (!thumbnailinatorEnabled) return;

    if (
      thumbnailinatorResult === "none" ||
      thumbnailinatorResult === "failed"
    ) {
      return;
    }

    if (!thumbnailinatorResult || thumbnailinatorResult === "pending") {
      return TRANSPARENT_PIXEL;
    }

    return thumbnailinatorResult;
  })();

  function onError() {
    setError(true);
  }

  useEffect(() => {
    if (thumbnail === TRANSPARENT_PIXEL && !thumbnailinatorResult) {
      dispatch(fetchThumbnail(url));
    }
  }, [dispatch, thumbnail, thumbnailinatorResult, url]);

  function buildCompactIcon() {
    if (error) return <LinkPreview type={linkType} />;

    if (commentType === "image" || isUrlImage(url, undefined))
      return (
        <CachedImg
          className={styles.thumbnailImg}
          src={forceSecureUrl(url)}
          pictrsOptions={{
            size: 100,
          }}
          onError={onError}
        />
      );

    if (linkType || !compact || !thumbnail)
      return <LinkPreview type={linkType} />;

    return (
      <CachedImg
        className={styles.thumbnailImg}
        src={forceSecureUrl(
          typeof thumbnail === "string" ? thumbnail : thumbnail.sm,
        )}
        pictrsOptions={{
          size: 100,
        }}
        onError={onError}
      />
    );
  }

  const isSmall = small || (!compact && !!thumbnail);

  return (
    <LinkInterceptor
      className={cx(styles.container, className)}
      href={url}
      onClick={handleLinkClick}
      onClickCompleted={onClickCompleted}
      draggable="false"
    >
      {!compact && thumbnail && !error && (
        <CachedImg
          src={forceSecureUrl(
            typeof thumbnail === "string" ? thumbnail : thumbnail.lg,
          )}
          draggable="false"
          className={cx(styles.img, blur && styles.blurImg)}
          onError={onError}
        />
      )}
      <div className={cx(styles.bottom, isSmall && styles.small)}>
        {buildCompactIcon()}
        <div className={styles.urlContainer}>
          <div className={styles.text}>
            <PostTitleMarkdown>{text ?? ""}</PostTitleMarkdown>
          </div>
          <Url>{url}</Url>
        </div>
        <IonIcon icon={chevronForward} className={styles.chevronIcon} />
      </div>
    </LinkInterceptor>
  );
}
