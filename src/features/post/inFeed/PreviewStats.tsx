import styled from "@emotion/styled";
import { IonIcon } from "@ionic/react";
import { chatbubbleOutline, timeOutline } from "ionicons/icons";
import { PostAggregates } from "lemmy-js-client";
import Ago from "../../labels/Ago";
import Vote from "../../labels/Vote";

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

interface PreviewStatsProps {
  stats: PostAggregates;
  voteFromServer: number | undefined;
  savedFromServer: boolean;
  published: string;
}

export default function PreviewStats({
  stats,
  voteFromServer,
  published,
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
      <Ago date={published} />
    </Container>
  );
}
