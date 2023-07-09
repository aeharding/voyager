import { useAppDispatch, useAppSelector } from "../../store";
import { IonIcon, useIonToast } from "@ionic/react";
import { arrowDownSharp, arrowUpSharp } from "ionicons/icons";
import styled from "@emotion/styled";
import { voteOnPost } from "../post/postSlice";
import { useContext } from "react";
import { voteOnComment } from "../comment/commentSlice";
import { voteError } from "../../helpers/toastMessages";
import { PageContext } from "../auth/PageContext";
import { calculateCurrentVotesCount } from "../../helpers/vote";
import { CommentView, PostView } from "lemmy-js-client";

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
  item: PostView | CommentView;
  className?: string;
}

export default function Vote({ item, className }: VoteProps) {
  const [present] = useIonToast();
  const dispatch = useAppDispatch();
  const votesById = useAppSelector((state) =>
    "comment" in item
      ? state.comment.commentVotesById
      : state.post.postVotesById
  );
  const id = "comment" in item ? item.comment.id : item.post.id;

  const myVote = votesById[id] ?? item.my_vote;
  const score = calculateCurrentVotesCount(item, votesById);

  const { presentLoginIfNeeded } = useContext(PageContext);

  return (
    <Container
      className={className}
      vote={myVote as 1 | 0 | -1}
      onClick={async (e) => {
        e.stopPropagation();
        e.preventDefault();

        if (presentLoginIfNeeded()) return;

        let dispatcherFn;
        if ("comment" in item) {
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
