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
}

export default function Stats({ stats }: StatsProps) {
  return (
    <Container>
      <Vote stats={stats} />
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
