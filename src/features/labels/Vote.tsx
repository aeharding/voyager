import { useAppDispatch, useAppSelector } from "../../store";
import { IonIcon, useIonToast } from "@ionic/react";
import { arrowDownSharp, arrowUpSharp } from "ionicons/icons";
import styled from "@emotion/styled";
import { voteOnPost } from "../post/postSlice";
import { useContext } from "react";
import { voteOnComment } from "../comment/commentSlice";
import { voteError } from "../../helpers/toastMessages";
import { PageContext } from "../auth/PageContext";

const Container = styled.div<{ vote: 1 | -1 | 0 | undefined }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;

  && {
    color: ${({ vote }) => {
      switch (vote) {
        case 1:
          return "var(--ion-color-primary)";
        case -1:
          return "var(--ion-color-danger)";
      }
    }};
  }
`;

interface VoteProps {
  type: "comment" | "post";
  id: number;
  score: number;
  voteFromServer: 1 | -1 | 0 | undefined;
  className?: string;
}

export default function Vote({
  type,
  id,
  voteFromServer,
  score: existingScore,
  className,
}: VoteProps) {
  const [present] = useIonToast();
  const dispatch = useAppDispatch();
  const votesById = useAppSelector((state) =>
    type === "comment"
      ? state.comment.commentVotesById
      : state.post.postVotesById
  );

  const myVote = votesById[id] ?? voteFromServer;
  const score = existingScore - (voteFromServer ?? 0) + (votesById[id] ?? 0);

  const { presentLoginIfNeeded } = useContext(PageContext);

  return (
    <Container
      className={className}
      vote={myVote}
      onClick={async (e) => {
        e.stopPropagation();
        e.preventDefault();

        if (presentLoginIfNeeded()) return;

        let dispatcherFn;
        if (type === "comment") {
          dispatcherFn = voteOnComment;
        } else {
          dispatcherFn = voteOnPost;
        }

        try {
          await dispatch(dispatcherFn(id, myVote ? 0 : 1));
        } catch (error) {
          present(voteError);

          throw error;
        }
      }}
    >
      <IonIcon icon={myVote === -1 ? arrowDownSharp : arrowUpSharp} /> {score}
    </Container>
  );
}
