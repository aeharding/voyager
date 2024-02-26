import { styled } from "@linaria/react";
import { css } from "@linaria/core";
import { IonIcon } from "@ionic/react";
import {
  albumsOutline,
  chatboxOutline,
  chevronForward,
  linkOutline,
  peopleOutline,
  personOutline,
} from "ionicons/icons";
import { PostView } from "lemmy-js-client";
import { MouseEvent, useContext, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { isNsfwBlurred } from "../../labels/Nsfw";
import LinkInterceptor from "../../shared/markdown/LinkInterceptor";
import useLemmyUrlHandler from "../../shared/useLemmyUrlHandler";
import Url from "../../shared/Url";
import { useAutohidePostIfNeeded } from "../../feed/PageTypeContext";
import { setPostRead } from "../postSlice";
import { InFeedContext } from "../../feed/Feed";
import { preventOnClickNavigationBug } from "../../../helpers/ionic";

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

const blurImgCss = css`
  filter: blur(40px);

  // https://graffino.com/til/CjT2jrcLHP-how-to-fix-filter-blur-performance-issue-in-safari
  transform: translate3d(0, 0, 0);
`;

const Bottom = styled.div`
  display: flex;
  align-items: center;

  gap: 0.75rem;
  padding: 0.65rem;

  color: var(--ion-color-text-aside);

  .theme-dark & {
    color: var(--ion-color-medium);
  }

  background: var(--lightroom-bg);

  .cross-post & {
    background: none;
  }

  @media (min-width: 700px) {
    gap: 1rem;
    padding: 0.65rem 1rem;
  }
`;

const EmbedIcon = styled(IonIcon)`
  font-size: 1.5rem;
`;

const Divider = styled.div`
  width: 1px;
  height: 1.3rem;
  background: currentColor;
  opacity: 0.5;
`;

const UrlContainer = styled.div`
  flex: 1;
  font-size: 0.875em;

  margin-right: -0.5rem; // fudge it closer

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface EmbedProps {
  post: PostView;
  className?: string;
}

export default function Embed({ post, className }: EmbedProps) {
  const dispatch = useAppDispatch();
  const autohidePostIfNeeded = useAutohidePostIfNeeded();
  const { determineObjectTypeFromUrl } = useLemmyUrlHandler();

  const inFeed = useContext(InFeedContext);

  const [error, setError] = useState(false);
  const blurNsfw = useAppSelector(
    (state) => state.settings.appearance.posts.blurNsfw,
  );

  const icon = useMemo(() => {
    const type = post.post.url
      ? determineObjectTypeFromUrl(post.post.url)
      : undefined;

    switch (type) {
      case "comment":
        return chatboxOutline;
      case "community":
        return peopleOutline;
      case "post":
        return albumsOutline;
      case "user":
        return personOutline;
      case undefined:
        return linkOutline;
    }
  }, [post.post.url, determineObjectTypeFromUrl]);

  const handleLinkClick = (e: MouseEvent) => {
    e.stopPropagation();

    if (preventOnClickNavigationBug(e)) return;

    dispatch(setPostRead(post.post.id));
    autohidePostIfNeeded(post);
  };

  if (!post.post.url) return;

  const blur = inFeed ? isNsfwBlurred(post, blurNsfw) : false;

  return (
    <Container
      className={className}
      href={post.post.url}
      onClick={handleLinkClick}
      draggable="false"
    >
      {post.post.thumbnail_url && !error && (
        <Img
          src={post.post.thumbnail_url}
          draggable="false"
          className={blur ? blurImgCss : undefined}
          onError={() => setError(true)}
        />
      )}
      <Bottom>
        <EmbedIcon icon={icon} />
        <Divider />
        <UrlContainer>
          <Url>{post.post.url}</Url>
        </UrlContainer>
        <IonIcon icon={chevronForward} />
      </Bottom>
    </Container>
  );
}
