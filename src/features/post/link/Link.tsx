import { styled } from "@linaria/react";
import { css } from "@linaria/core";
import { IonIcon } from "@ionic/react";
import { chevronForward } from "ionicons/icons";
import { MouseEvent, useState } from "react";
import LinkInterceptor from "../../shared/markdown/LinkInterceptor";
import Url from "../../shared/Url";
import { preventOnClickNavigationBug } from "../../../helpers/ionic";
import LinkPreview from "./LinkPreview";
import { LinkData } from "../../comment/CommentLinks";

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
  margin: -10px 0 -10px -10px;
  height: 60px;
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

  min-height: 50px;

  gap: ${({ small }) => (small ? "8px" : "12px")};
  padding: ${({ small }) => (small ? "4px 8px" : "10px")};

  color: var(--ion-color-text-aside);
  background: var(--lightroom-bg);

  .cross-post & {
    background: none;
  }

  @media (min-width: 700px) {
    gap: 16px;
    padding: 10px 16px;
  }
`;

const Text = styled.div``;

const UrlContainer = styled.div`
  flex: 1;
  font-size: 0.875em;

  margin-right: -0.5rem; // fudge it closer

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  thumbnail,
  compact = true,
  blur,
  className,
  onClick,
  small,
  commentType,
}: EmbedProps) {
  const [error, setError] = useState(false);

  const handleLinkClick = (e: MouseEvent) => {
    e.stopPropagation();

    if (preventOnClickNavigationBug(e)) return;

    onClick?.(e);
  };

  const compactIcon = (() => {
    if (!compact || !thumbnail)
      return (
        <LinkPreview
          url={url}
          thumbnail={thumbnail}
          type={compact ? (thumbnail ? "image" : undefined) : commentType}
          text={text}
        />
      );

    return <ThumbnailImg src={thumbnail} />;
  })();

  return (
    <Container
      className={className}
      href={url}
      onClick={handleLinkClick}
      draggable="false"
    >
      {!compact && thumbnail && !error && (
        <Img
          src={thumbnail}
          draggable="false"
          className={blur ? blurImgCss : undefined}
          onError={() => setError(true)}
        />
      )}
      <Bottom small={small}>
        {compactIcon}
        <UrlContainer>
          <Text>{text}</Text>
          <Url>{url}</Url>
        </UrlContainer>
        <IonIcon icon={chevronForward} />
      </Bottom>
    </Container>
  );
}
