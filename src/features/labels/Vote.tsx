import { ImpactStyle } from "@capacitor/haptics";
import { arrowDownSharp, arrowUpSharp } from "ionicons/icons";
import { CommentView, PostView } from "lemmy-js-client";
import React, { useContext } from "react";

import { PageContext } from "#/features/auth/PageContext";
import { isDownvoteEnabledSelector } from "#/features/auth/siteSlice";
import { voteOnComment } from "#/features/comment/commentSlice";
import { voteOnPost } from "#/features/post/postSlice";
import { getVoteErrorMessage } from "#/helpers/lemmyErrors";
import { formatNumber } from "#/helpers/number";
import { downvotesDisabled } from "#/helpers/toastMessages";
import useAppToast from "#/helpers/useAppToast";
import useHapticFeedback from "#/helpers/useHapticFeedback";
import { calculateSeparateScore, calculateTotalScore } from "#/helpers/vote";
import { OVoteDisplayMode } from "#/services/db";
import { useAppDispatch, useAppSelector } from "#/store";

import VoteStat from "./VoteStat";

import styles from "./Vote.module.css";
interface VoteProps {
  item: PostView | CommentView;
  className?: string;
  spacer?: boolean;
}

export default function Vote({
  item,
  className,
  spacer,
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
            button
            icon={arrowUpSharp}
            className={className}
            iconClassName={styles.icon}
            currentVote={myVote}
            voteRepresented={1}
            onClick={async (e) => {
              await onVote(e, myVote === 1 ? 0 : 1);
            }}
          >
            {formatNumber(upvotes)}
          </VoteStat>

          {spacer && <div className={styles.spacer}></div>}

          <VoteStat
            button
            icon={arrowDownSharp}
            className={className}
            iconClassName={styles.icon}
            currentVote={myVote}
            voteRepresented={-1}
            onClick={async (e) => {
              await onVote(e, myVote === -1 ? 0 : -1);
            }}
          >
            {formatNumber(downvotes)}
          </VoteStat>

          {spacer && <div className={styles.spacer}></div>}
        </>
      );
    }
    case OVoteDisplayMode.Hide:
      return (
        <VoteStat
          button
          icon={myVote === -1 ? arrowDownSharp : arrowUpSharp}
          className={className}
          iconClassName={styles.icon}
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
          button
          icon={myVote === -1 ? arrowDownSharp : arrowUpSharp}
          className={className}
          iconClassName={styles.icon}
          currentVote={myVote}
          onClick={async (e) => {
            await onVote(e, myVote ? 0 : 1);
          }}
        >
          {formatNumber(score)}

          {spacer && <div className={styles.spacer}></div>}
        </VoteStat>
      );
    }
  }
}
