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
  voteFromServer: number | undefined;
}

export default function PreviewStats({
  stats,
  voteFromServer,
}: PreviewStatsProps) {
  return (
    <Container>
      <Vote
        score={stats.score}
        voteFromServer={voteFromServer as 1 | 0 | -1 | undefined}
        id={stats.post_id}
        type="post"
      />
      <IonIcon icon={chatbubbleOutline} />
      {stats.comments}
      <IonIcon icon={timeOutline} />
      <Ago date={stats.published} />
    </Container>
  );
}
