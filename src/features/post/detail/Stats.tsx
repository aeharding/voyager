import styled from "@emotion/styled";
import { IonIcon } from "@ionic/react";
import { happyOutline, timeOutline } from "ionicons/icons";
import { PostView } from "lemmy-js-client";
import Ago from "../../labels/Ago";
import Vote from "../../labels/Vote";
import Edited from "../../labels/Edited";

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;

  font-size: 0.8rem;
  color: var(--ion-color-text-aside);
`;

interface StatsProps {
  post: PostView;
}

export default function Stats({ post }: StatsProps) {
  return (
    <Container>
      <Vote item={post} />
      <IonIcon icon={happyOutline} />
      {Math.round(
        (post.counts.upvotes + post.counts.downvotes
          ? post.counts.upvotes / (post.counts.upvotes + post.counts.downvotes)
          : 1) * 100
      )}
      %
      <IonIcon icon={timeOutline} />
      <Ago date={post.post.published} />
      <Edited item={post} showDate />
    </Container>
  );
}
