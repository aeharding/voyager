import { CommentAggregates, PostAggregates } from "lemmy-js-client";
import { useAppDispatch, useAppSelector } from "../store";
import { IonIcon, useIonModal, useIonToast } from "@ionic/react";
import { arrowDownSharp, arrowUpSharp } from "ionicons/icons";
import styled from "@emotion/styled";
import { voteOnPost } from "../features/post/postSlice";
import Login from "../features/auth/Login";
import { useContext } from "react";
import { PageContext } from "../features/auth/PageContext";
import { voteOnComment } from "../features/comment/commentSlice";
import { voteError } from "../helpers/toastMessages";

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
}

export default function Vote({
  type,
  id,
  voteFromServer,
  score: existingScore,
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

  const jwt = useAppSelector((state) => state.auth.jwt);
  const [login, onDismiss] = useIonModal(Login, {
    onDismiss: (data: string, role: string) => onDismiss(data, role),
  });
  const pageContext = useContext(PageContext);

  return (
    <Container
      vote={myVote}
      onClick={async (e) => {
        e.stopPropagation();
        e.preventDefault();

        if (!jwt) return login({ presentingElement: pageContext.page });

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
