import { CommentAggregates, PostAggregates } from "lemmy-js-client";
import { useAppDispatch, useAppSelector } from "../store";
import { IonIcon, useIonModal } from "@ionic/react";
import { arrowDownSharp, arrowUpSharp } from "ionicons/icons";
import styled from "@emotion/styled";
import { voteOnPost } from "../features/post/postSlice";
import Login from "../features/auth/Login";
import { useContext } from "react";
import { PageContext } from "../features/auth/PageContext";
import { voteOnComment } from "../features/comment/commentSlice";

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
  stats: PostAggregates | CommentAggregates;
  type: "comment" | "post";
  id: number;
}

export default function Vote({ stats, type, id }: VoteProps) {
  const dispatch = useAppDispatch();
  const votesById = useAppSelector((state) =>
    type === "comment"
      ? state.comment.commentVotesById
      : state.post.postVotesById
  );

  const myVote = votesById[type === "comment" ? id : id] ?? 0;
  const score = stats.score + myVote;

  const jwt = useAppSelector((state) => state.auth.jwt);
  const [login, onDismiss] = useIonModal(Login, {
    onDismiss: (data: string, role: string) => onDismiss(data, role),
  });
  const pageContext = useContext(PageContext);

  return (
    <Container
      vote={myVote}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();

        if (!jwt) return login({ presentingElement: pageContext.page });

        let dispatcherFn;
        if (type === "comment") {
          dispatcherFn = voteOnComment;
        } else {
          dispatcherFn = voteOnPost;
        }

        dispatch(dispatcherFn(id, myVote ? 0 : 1));
      }}
    >
      <IonIcon icon={myVote === -1 ? arrowDownSharp : arrowUpSharp} /> {score}
    </Container>
  );
}
