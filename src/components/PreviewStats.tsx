import styled from "@emotion/styled";
import { IonIcon } from "@ionic/react";
import { arrowUpSharp, chatbubbleOutline, timeOutline } from "ionicons/icons";
import { PostAggregates } from "lemmy-js-client";
import Ago from "./Ago";
import { useAppSelector } from "../store";
import { css } from "@emotion/react";
import Vote from "./Vote";

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
      <Vote stats={stats} />
      <IonIcon icon={chatbubbleOutline} />
      {stats.comments}
      <IonIcon icon={timeOutline} />
      <Ago date={new Date(stats.published)} />
    </Container>
  );
}
