import styled from "@emotion/styled";
import { IonIcon } from "@ionic/react";
import { chevronForward, linkOutline } from "ionicons/icons";
import { PostView } from "lemmy-js-client";

const Container = styled.a`
  display: flex;
  flex-direction: column;

  border-radius: 0.5rem;
  overflow: hidden;

  color: inherit;
  text-decoration: none;
`;

const Img = styled.img`
  flex: 1;
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
  return (
    <Container
      className={className}
      href={post.post.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
    >
      {post.post.thumbnail_url && <Img src={post.post.thumbnail_url} />}
      <Bottom>
        <EmbedIcon icon={linkOutline} />
        <Url>{post.post.url}</Url>
        <IonIcon icon={chevronForward} />
      </Bottom>
    </Container>
  );
}
