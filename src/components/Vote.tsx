import { PostAggregates } from "lemmy-js-client";
import { useAppDispatch, useAppSelector } from "../store";
import { IonIcon } from "@ionic/react";
import { arrowDownSharp, arrowUpSharp } from "ionicons/icons";
import styled from "@emotion/styled";
import { voteOnPost } from "../features/post/postSlice";

const Container = styled.div<{ vote: 1 | -1 | 0 | undefined }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;

  color: ${({ vote }) => {
    switch (vote) {
      case 1:
        return "var(--ion-color-primary)";
      case -1:
        return "var(--ion-color-danger)";
    }
  }};
`;

interface VoteProps {
  stats: PostAggregates;
}

export default function Vote({ stats }: VoteProps) {
  const dispatch = useAppDispatch();
  const postVotesById = useAppSelector((state) => state.post.postVotesById);

  const myVote = postVotesById[stats.post_id] ?? 0;
  const score = stats.score + myVote;

  return (
    <Container
      vote={myVote}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();

        dispatch(voteOnPost(stats.post_id, myVote ? 0 : 1));
      }}
    >
      <IonIcon icon={myVote === -1 ? arrowDownSharp : arrowUpSharp} /> {score}
    </Container>
  );
}
