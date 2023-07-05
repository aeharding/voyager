import styled from "@emotion/styled";
import { chatbubbleOutline, timeOutline } from "ionicons/icons";
import { PostAggregates } from "lemmy-js-client";
import Ago from "../../labels/Ago";
import Vote from "../../labels/Vote";
import IonIconWrapper from "../../../helpers/ionIconWrapper";

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

interface PreviewStatsProps {
  stats: PostAggregates;
  voteFromServer: number | undefined;
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
      <IonIconWrapper icon={chatbubbleOutline} />
      {stats.comments}
      <IonIconWrapper icon={timeOutline} />
      <Ago date={published} />
    </Container>
  );
}
