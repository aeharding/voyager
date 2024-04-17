import { styled } from "@linaria/react";
import { happyOutline, timeOutline } from "ionicons/icons";
import { PostView } from "lemmy-js-client";
import Ago from "../../labels/Ago";
import Vote from "../../labels/Vote";
import Edited from "../../labels/Edited";
import Stat from "./Stat";
import { css } from "@linaria/core";

export const sharedStatsClass = css`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Container = styled.div`
  font-size: 0.8rem;
  color: var(--ion-color-text-aside);
`;

interface StatsProps {
  post: PostView;
}

export default function Stats({ post }: StatsProps) {
  return (
    <Container className={sharedStatsClass}>
      <Vote item={post} />
      <Stat icon={happyOutline}>
        {Math.round(
          (post.counts.upvotes + post.counts.downvotes
            ? post.counts.upvotes /
              (post.counts.upvotes + post.counts.downvotes)
            : 1) * 100,
        )}
        %
      </Stat>
      <Stat icon={timeOutline}>
        <Ago date={post.post.published} />
      </Stat>
      <Edited item={post} showDate />
    </Container>
  );
}
