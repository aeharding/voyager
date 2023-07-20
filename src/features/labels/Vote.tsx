import { useAppDispatch, useAppSelector } from "../../store";
import { IonIcon, useIonToast } from "@ionic/react";
import { arrowDownSharp, arrowUpSharp } from "ionicons/icons";
import styled from "@emotion/styled";
import { voteOnPost } from "../post/postSlice";
import React, { useContext } from "react";
import { voteOnComment } from "../comment/commentSlice";
import { voteError } from "../../helpers/toastMessages";
import { PageContext } from "../auth/PageContext";
import { calculateNetVoteCount, calculateVoteCounts } from "../../helpers/vote";
import { CommentView, PostView } from "lemmy-js-client";
import { OVoteDisplayMode } from "../../services/db";

const Container = styled.div<{
  vote?: 1 | -1 | 0;
  voteRepresented?: 1 | -1;
}>`
  display: flex;
  align-items: center;
  gap: 0.25rem;

  && {
    color: ${({ vote, voteRepresented }) => {
      if (voteRepresented === undefined || vote === voteRepresented) {
        switch (vote) {
          case 1:
            return "var(--ion-color-primary)";
          case -1:
            return "var(--ion-color-danger)";
        }
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

  const myVote = votesById[id] ?? (item.my_vote as -1 | 0 | 1 | undefined) ?? 0;

  const { presentLoginIfNeeded } = useContext(PageContext);

  async function onVote(e: React.MouseEvent, vote: 0 | 1 | -1) {
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
      await dispatch(dispatcherFn(id, vote));
    } catch (error) {
      present(voteError);
      throw error;
    }
  }

  const voteDisplayMode = useAppSelector(
    (state) => state.settings.appearance.voting.voteDisplayMode
  );

  switch (voteDisplayMode) {
    case OVoteDisplayMode.SeparateScores: {
      const { upvotes, downvotes } = calculateVoteCounts(item, votesById);
      return (
        <>
          <Container
            className={className + "-up"}
            vote={myVote}
            voteRepresented={1}
            onClick={async (e) => {
              await onVote(e, myVote === 1 ? 0 : 1);
            }}
          >
            <IonIcon icon={arrowUpSharp} /> {upvotes}
          </Container>
          <Container
            className={className + "-down"}
            vote={myVote}
            voteRepresented={-1}
            onClick={async (e) => {
              await onVote(e, myVote === -1 ? 0 : -1);
            }}
          >
            <IonIcon icon={arrowDownSharp} /> {downvotes}
          </Container>
        </>
      );
    }
    case OVoteDisplayMode.NoScores:
      return (
        <Container
          className={className}
          vote={myVote}
          onClick={async (e) => {
            await onVote(e, myVote ? 0 : 1);
          }}
        >
          <IonIcon icon={myVote === -1 ? arrowDownSharp : arrowUpSharp} />
        </Container>
      );
    default: {
      const score = calculateNetVoteCount(item, votesById);
      return (
        <Container
          className={className}
          vote={myVote}
          onClick={async (e) => {
            await onVote(e, myVote ? 0 : 1);
          }}
        >
          <IonIcon icon={myVote === -1 ? arrowDownSharp : arrowUpSharp} />{" "}
          {score}
        </Container>
      );
    }
  }
}
