import { IonIcon } from "@ionic/react";
import { css } from "@linaria/core";
import { styled } from "@linaria/react";
import { chevronForward } from "ionicons/icons";
import { MouseEvent, useEffect, useMemo, useState } from "react";

import { LinkData } from "#/features/comment/CommentLinks";
import Url from "#/features/shared/Url";
import LinkInterceptor from "#/features/shared/markdown/LinkInterceptor";
import PlaintextMarkdown from "#/features/shared/markdown/PlaintextMarkdown";
import useLemmyUrlHandler from "#/features/shared/useLemmyUrlHandler";
import { preventOnClickNavigationBug } from "#/helpers/ionic";
import { determineTypeFromUrl, isUrlImage } from "#/helpers/url";
import { getImageSrc } from "#/services/lemmy";
import { useAppDispatch, useAppSelector } from "#/store";

import LinkPreview from "./LinkPreview";
import { fetchThumbnail } from "./thumbnail/thumbnailSlice";

const TRANSPARENT_PIXEL =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';

const Container = styled(LinkInterceptor)`
  display: flex;
  flex-direction: column;

  border-radius: 0.5rem;
  overflow: hidden;

  color: inherit;
  text-decoration: none;
  -webkit-touch-callout: default;

  .cross-post & {
    border: 1px solid rgba(var(--ion-color-dark-rgb), 0.15);
    border-bottom-right-radius: 0.5rem;
    border-bottom-left-radius: 0.5rem;
  }
`;

const Img = styled.img`
  min-height: 0;
  aspect-ratio: 16 / 9;

  object-fit: cover;
`;

const ThumbnailImg = styled.img`
  margin: calc(-1 * var(--top-padding)) 0 calc(-1 * var(--top-padding))
    calc(-1 * var(--start-padding));
  height: var(--height);
  aspect-ratio: 0.85;
  width: auto;
  object-fit: cover;
`;

const blurImgCss = css`
  filter: blur(40px);

  // https://graffino.com/til/CjT2jrcLHP-how-to-fix-filter-blur-performance-issue-in-safari
  transform: translate3d(0, 0, 0);
`;

const Bottom = styled.div<{ small?: boolean }>`
  display: flex;
  align-items: center;

  --height: ${({ small }) => (small ? "50px" : "55px")};
  min-height: var(--height);

  --gap: ${({ small }) => (small ? "8px" : "10px")};

  gap: var(--gap);

  --start-padding: ${({ small }) => (small ? "8px" : "10px")};
  --top-padding: ${({ small }) => (small ? "4px" : "8px")};

  padding: var(--top-padding) var(--start-padding);

  color: var(--ion-color-medium);
  background: var(--lightroom-bg);

  @media (min-width: 700px) {
    --gap: 16px;
    --start-padding: 16px;
  }

  .cross-post & {
    background: none;
  }
`;

const Text = styled.div`
  color: var(--ion-text-color);

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UrlContainer = styled.div`
  flex: 1;
  font-size: 0.875em;

  margin-right: -0.5rem; // fudge it closer

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ChevronIcon = styled(IonIcon)`
  font-size: 20px;
  opacity: 0.4;
  margin: 0 -3px;
`;

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

  const linkType = useMemo(
    () => determineObjectTypeFromUrl(url) ?? determineTypeFromUrl(url),
    [url, determineObjectTypeFromUrl],
  );
  const isImage = useMemo(() => isUrlImage(url), [url]);

  const handleLinkClick = (e: MouseEvent) => {
    e.stopPropagation();

    if (preventOnClickNavigationBug(e)) return;

    onClick?.(e);
  };

  const thumbnail = useMemo(() => {
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
  }, [lemmyThubmnail, thumbnailinatorResult, thumbnailinatorEnabled]);

  useEffect(() => {
    if (thumbnail === TRANSPARENT_PIXEL && !thumbnailinatorResult) {
      dispatch(fetchThumbnail(url));
    }
  }, [dispatch, thumbnail, thumbnailinatorResult, url]);

  const compactIcon = useMemo(() => {
    if (commentType === "image" || isImage)
      return <ThumbnailImg src={getImageSrc(url, { size: 50 })} />;

    if (linkType || !compact || !thumbnail)
      return <LinkPreview type={linkType} />;

    return (
      <ThumbnailImg
        src={typeof thumbnail === "string" ? thumbnail : thumbnail.sm}
      />
    );
  }, [commentType, compact, isImage, linkType, thumbnail, url]);

  return (
    <Container
      className={className}
      href={url}
      onClick={handleLinkClick}
      draggable="false"
    >
      {!compact && thumbnail && !error && (
        <Img
          src={typeof thumbnail === "string" ? thumbnail : thumbnail.lg}
          draggable="false"
          className={blur ? blurImgCss : undefined}
          onError={() => setError(true)}
        />
      )}
      <Bottom small={small || (!compact && !!thumbnail)}>
        {compactIcon}
        <UrlContainer>
          <Text>
            <PlaintextMarkdown>{text}</PlaintextMarkdown>
          </Text>
          <Url>{url}</Url>
        </UrlContainer>
        <ChevronIcon icon={chevronForward} />
      </Bottom>
    </Container>
  );
}
