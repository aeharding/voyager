import styled from "@emotion/styled";
import { IonIcon } from "@ionic/react";
import { chatbubbleOutline, timeOutline } from "ionicons/icons";
import { PostView } from "lemmy-js-client";
import Ago from "../../labels/Ago";
import Vote from "../../labels/Vote";

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

interface PreviewStatsProps {
  post: PostView;
}

export default function PreviewStats({ post }: PreviewStatsProps) {
  return (
    <Container>
      <Vote item={post} />
      <IonIcon icon={chatbubbleOutline} />
      {post.counts.comments}
      <IonIcon icon={timeOutline} />
      <Ago date={post.post.published} />
    </Container>
  );
}
