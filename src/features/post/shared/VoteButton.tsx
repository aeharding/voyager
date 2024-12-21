import { ImpactStyle } from "@capacitor/haptics";
import { IonIcon } from "@ionic/react";
import { arrowDownSharp, arrowUpSharp } from "ionicons/icons";
import { PostView } from "lemmy-js-client";
import { useContext, useEffect } from "react";
import { useTransition } from "react-transition-state";

import { PageContext } from "#/features/auth/PageContext";
import { isDownvoteEnabledSelector } from "#/features/auth/siteSlice";
import { ActionButton } from "#/features/post/actions/ActionButton";
import {
  bgColorToVariable,
  VOTE_COLORS,
} from "#/features/settings/appearance/themes/votesTheme/VotesTheme";
import { cx, sv } from "#/helpers/css";
import { getVoteErrorMessage } from "#/helpers/lemmyErrors";
import useAppToast from "#/helpers/useAppToast";
import useHapticFeedback from "#/helpers/useHapticFeedback";
import { useAppDispatch, useAppSelector } from "#/store";

import { voteOnPost } from "../postSlice";

import styles from "./VoteButton.module.css";

interface VoteButtonProps {
  type: "down" | "up";
  post: PostView;
}

export function VoteButton({ type, post }: VoteButtonProps) {
  const presentToast = useAppToast();
  const dispatch = useAppDispatch();
  const vibrate = useHapticFeedback();
  const { presentLoginIfNeeded } = useContext(PageContext);
  const downvoteAllowed = useAppSelector(isDownvoteEnabledSelector);

  const postVotesById = useAppSelector((state) => state.post.postVotesById);
  const myVote = postVotesById[post.post.id];

  const [state, toggle] = useTransition();

  const icon = useIcon(type);
  const selectedVote = useVote(type);
  const activeColor = useActiveColor(type);

  const on = myVote === selectedVote;

  useEffect(() => {
    if (!on) toggle(false);
  }, [on, toggle]);

  if (type === "down" && !downvoteAllowed) {
    return undefined;
  }

  return (
    <ActionButton
      style={sv({ background: on ? activeColor : undefined })}
      className={cx(
        state.status === "entering" && styles.entering,
        on && styles.active,
      )}
      onClick={async (e) => {
        e.stopPropagation();

        vibrate({ style: ImpactStyle.Light });

        if (presentLoginIfNeeded()) return;

        if (!on) {
          toggle(true);
        }

        dispatch(
          voteOnPost(post, myVote === selectedVote ? 0 : selectedVote),
        ).catch((error) => {
          presentToast({
            color: "danger",
            message: getVoteErrorMessage(error),
          });

          throw error;
        });
      }}
    >
      <IonIcon icon={icon} />
    </ActionButton>
  );
}

function useActiveColor(type: VoteButtonProps["type"]) {
  const votesTheme = useAppSelector(
    (state) => state.settings.appearance.votesTheme,
  );

  switch (type) {
    case "up":
      return bgColorToVariable(VOTE_COLORS.UPVOTE[votesTheme]);
    case "down":
      return bgColorToVariable(VOTE_COLORS.DOWNVOTE[votesTheme]);
  }
}

function useIcon(type: VoteButtonProps["type"]) {
  switch (type) {
    case "down":
      return arrowDownSharp;
    case "up":
      return arrowUpSharp;
  }
}

function useVote(type: VoteButtonProps["type"]) {
  switch (type) {
    case "down":
      return -1;
    case "up":
      return 1;
  }
}
