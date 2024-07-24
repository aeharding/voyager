import { useAppDispatch, useAppSelector } from "../../store";
import { arrowDownSharp, arrowUpSharp } from "ionicons/icons";
import { voteOnPost } from "../post/postSlice";
import React, { useContext } from "react";
import { voteOnComment } from "../comment/commentSlice";
import { downvotesDisabled } from "../../helpers/toastMessages";
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
import { getVoteErrorMessage } from "../../helpers/lemmyErrors";
import { PlainButton } from "../shared/PlainButton";
import { css } from "@linaria/core";
import VoteStat from "./VoteStat";

const iconClass = css`
  // Vote icons are tall and narrow, but svg container is square.
  // This creates visually inconsistent padding.
  // So fudge it so it looks better next to more square icons
  margin: 0 -2px;
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
      await dispatch(dispatcherFn(item as CommentView & PostView, vote));
    } catch (error) {
      presentToast({
        color: "danger",
        message: getVoteErrorMessage(error),
      });

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
          <VoteStat
            statEl={PlainButton}
            icon={arrowUpSharp}
            className={className}
            iconClassName={iconClass}
            currentVote={myVote}
            voteRepresented={1}
            onClick={async (e) => {
              await onVote(e, myVote === 1 ? 0 : 1);
            }}
          >
            {formatNumber(upvotes)}
          </VoteStat>
          <VoteStat
            statEl={PlainButton}
            icon={arrowDownSharp}
            className={className}
            iconClassName={iconClass}
            currentVote={myVote}
            voteRepresented={-1}
            onClick={async (e) => {
              await onVote(e, myVote === -1 ? 0 : -1);
            }}
          >
            {formatNumber(downvotes)}
          </VoteStat>
        </>
      );
    }
    case OVoteDisplayMode.Hide:
      return (
        <VoteStat
          statEl={PlainButton}
          icon={myVote === -1 ? arrowDownSharp : arrowUpSharp}
          className={className}
          iconClassName={iconClass}
          currentVote={myVote}
          onClick={async (e) => {
            await onVote(e, myVote ? 0 : 1);
          }}
        />
      );
    // Total score
    default: {
      const score = calculateTotalScore(item, votesById);
      return (
        <VoteStat
          statEl={PlainButton}
          icon={myVote === -1 ? arrowDownSharp : arrowUpSharp}
          className={className}
          iconClassName={iconClass}
          currentVote={myVote}
          onClick={async (e) => {
            await onVote(e, myVote ? 0 : 1);
          }}
        >
          {formatNumber(score)}
        </VoteStat>
      );
    }
  }
}
