import styled from "@emotion/styled";
import { IonIcon } from "@ionic/react";
import { arrowUpSharp, happyOutline, timeOutline } from "ionicons/icons";
import { PostAggregates } from "lemmy-js-client";
import Ago from "./Ago";
import Vote from "./Vote";

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;

  font-size: 0.8rem;
  color: var(--ion-color-medium);
`;

interface StatsProps {
  stats: PostAggregates;
  voteFromServer: number | undefined;
}

export default function Stats({ stats, voteFromServer }: StatsProps) {
  return (
    <Container>
      <Vote
        voteFromServer={voteFromServer as 1 | 0 | -1 | undefined}
        score={stats.score}
        id={stats.post_id}
        type="post"
      />
      <IonIcon icon={happyOutline} />
      {Math.round(
        (stats.upvotes + stats.downvotes
          ? stats.upvotes / (stats.upvotes + stats.downvotes)
          : 1) * 100
      )}
      %
      <IonIcon icon={timeOutline} />
      <Ago date={stats.published} />
    </Container>
  );
}
