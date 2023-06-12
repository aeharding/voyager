import styled from "@emotion/styled";
import { IonIcon } from "@ionic/react";
import { arrowUpSharp, chatbubbleOutline, timeOutline } from "ionicons/icons";
import { PostAggregates } from "lemmy-js-client";

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

interface PreviewStatsProps {
  stats: PostAggregates;
}

export default function PreviewStats({ stats }: PreviewStatsProps) {
  return (
    <Container>
      <IonIcon icon={arrowUpSharp} /> {stats.score}
      <IonIcon icon={chatbubbleOutline} />
      {stats.comments}
      <IonIcon icon={timeOutline} />
      2h
    </Container>
  );
}
