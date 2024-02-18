import { useAppDispatch, useAppSelector } from "../../store";
import { IonIcon } from "@ionic/react";
import { arrowDownSharp, arrowUpSharp } from "ionicons/icons";
import { voteOnPost } from "../post/postSlice";
import React, { useContext } from "react";
import { voteOnComment } from "../comment/commentSlice";
import { downvotesDisabled, voteError } from "../../helpers/toastMessages";
import { PageContext } from "../auth/PageContext";
import {
  calculateTotalScore,
  calculateSeparateScore,
} from "../../helpers/vote";
import { CommentView, PostView } from "lemmy-js-client";
import { OVoteDisplayMode } from "../../services/db";
import { isDownvoteEnabledSelector } from "../auth/siteSlice";
import { ImpactStyle } from "@capacitor/haptics";
import useHapticFeedback from "../../helpers/useHapticFeedback";
import useAppToast from "../../helpers/useAppToast";
import { formatNumber } from "../../helpers/number";
import { styled } from "@linaria/react";

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
            return "var(--ion-color-primary-fixed)";
          case -1:
            return "var(--ion-color-danger)";
        }
      }

      return "inherit";
    }};
  }
`;

interface VoteProps {
  item: PostView | CommentView;
  className?: string;
}

export default function Vote({
  item,
  className,
}: VoteProps): React.ReactElement {
  const presentToast = useAppToast();
  const dispatch = useAppDispatch();
  const votesById = useAppSelector((state) =>
    "comment" in item
      ? state.comment.commentVotesById
      : state.post.postVotesById,
  );
  const id = "comment" in item ? item.comment.id : item.post.id;

  const myVote = votesById[id] ?? (item.my_vote as -1 | 0 | 1 | undefined) ?? 0;
  const canDownvote = useAppSelector(isDownvoteEnabledSelector);

  const { presentLoginIfNeeded } = useContext(PageContext);
  const vibrate = useHapticFeedback();

  async function onVote(e: React.MouseEvent, vote: 0 | 1 | -1) {
    e.stopPropagation();
    e.preventDefault();

    vibrate({ style: ImpactStyle.Light });

    if (presentLoginIfNeeded()) return;

    // you are allowed to un-downvote if they are disabled
    if (!canDownvote && vote === -1) {
      presentToast(downvotesDisabled);
      return;
    }

    let dispatcherFn;
    if ("comment" in item) {
      dispatcherFn = voteOnComment;
    } else {
      dispatcherFn = voteOnPost;
    }

    try {
      await dispatch(dispatcherFn(id, vote));
    } catch (error) {
      presentToast(voteError);
      throw error;
    }
  }

  const voteDisplayMode = useAppSelector(
    (state) => state.settings.appearance.voting.voteDisplayMode,
  );

  switch (voteDisplayMode) {
    case OVoteDisplayMode.Separate: {
      const { upvotes, downvotes } = calculateSeparateScore(item, votesById);
      return (
        <>
          <Container
            className={className}
            vote={myVote}
            voteRepresented={1}
            onClick={async (e) => {
              await onVote(e, myVote === 1 ? 0 : 1);
            }}
          >
            <IonIcon icon={arrowUpSharp} /> {formatNumber(upvotes)}
          </Container>
          <Container
            className={className}
            vote={myVote}
            voteRepresented={-1}
            onClick={async (e) => {
              await onVote(e, myVote === -1 ? 0 : -1);
            }}
          >
            <IonIcon icon={arrowDownSharp} /> {formatNumber(downvotes)}
          </Container>
        </>
      );
    }
    case OVoteDisplayMode.Hide:
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
    // Total score
    default: {
      const score = calculateTotalScore(item, votesById);
      return (
        <Container
          className={className}
          vote={myVote}
          onClick={async (e) => {
            await onVote(e, myVote ? 0 : 1);
          }}
        >
          <IonIcon icon={myVote === -1 ? arrowDownSharp : arrowUpSharp} />{" "}
          {formatNumber(score)}
        </Container>
      );
    }
  }
}
