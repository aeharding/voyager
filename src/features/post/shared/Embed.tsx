import { css } from "@emotion/react";
import styled from "@emotion/styled";
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
import { MouseEvent, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { isNsfwBlurred } from "../../labels/Nsfw";
import { setPostRead } from "../postSlice";
import LinkInterceptor from "../../shared/markdown/LinkInterceptor";
import useLemmyUrlHandler from "../../shared/useLemmyUrlHandler";

const Container = styled(LinkInterceptor)`
  display: flex;
  flex-direction: column;

  border-radius: 0.5rem;
  overflow: hidden;

  color: inherit;
  text-decoration: none;
  -webkit-touch-callout: default;
`;

const Img = styled.img<{ blur: boolean }>`
  min-height: 0;
  aspect-ratio: 16 / 9;

  object-fit: cover;

  ${({ blur }) =>
    blur &&
    css`
      filter: blur(40px);

      // https://graffino.com/til/CjT2jrcLHP-how-to-fix-filter-blur-performance-issue-in-safari
      transform: translate3d(0, 0, 0);
    `}
`;

const Bottom = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  opacity: 0.5;

  padding: 0.5rem 1rem;
  background: var(--ion-color-light);
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

const Url = styled.div`
  flex: 1;
  font-size: 0.875em;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface EmbedProps {
  post: PostView;
  className?: string;
}

export default function Embed({ post, className }: EmbedProps) {
  const [error, setError] = useState(false);
  const dispatch = useAppDispatch();
  const blurNsfw = useAppSelector(
    (state) => state.settings.appearance.posts.blurNsfw,
  );
  const { determineObjectTypeFromUrl } = useLemmyUrlHandler();

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
    dispatch(setPostRead(post.post.id));
  };

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
          blur={isNsfwBlurred(post, blurNsfw)}
          onError={() => setError(true)}
        />
      )}
      <Bottom>
        <EmbedIcon icon={icon} />
        <Divider />
        <Url>{post.post.url}</Url>
        <IonIcon icon={chevronForward} />
      </Bottom>
    </Container>
  );
}
