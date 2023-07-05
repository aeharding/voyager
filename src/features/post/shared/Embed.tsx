import styled from "@emotion/styled";
import { chevronForward, linkOutline } from "ionicons/icons";
import { PostView } from "lemmy-js-client";
import { useState } from "react";
import IonIconWrapper from "../../../helpers/ionIconWrapper";
import { IonIcon } from "@ionic/react";

const Container = styled.a`
  display: flex;
  flex-direction: column;

  border-radius: 0.5rem;
  overflow: hidden;

  color: inherit;
  text-decoration: none;
`;

const Img = styled.img`
  min-height: 0;
  aspect-ratio: 16 / 9;

  object-fit: cover;
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
  font-size: 0.9em;

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

  return (
    <Container
      className={className}
      href={post.post.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      draggable="false"
    >
      {post.post.thumbnail_url && !error && (
        <Img
          src={post.post.thumbnail_url}
          draggable="false"
          onError={() => setError(true)}
        />
      )}
      <Bottom>
        <EmbedIcon icon={linkOutline} />
        <Divider />
        <Url>{post.post.url}</Url>
        <IonIconWrapper icon={chevronForward} />
      </Bottom>
    </Container>
  );
}
