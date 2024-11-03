import { IonIcon } from "@ionic/react";
import { useContext, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { voteOnPost } from "../postSlice";
import { arrowDownSharp, arrowUpSharp } from "ionicons/icons";
import { ActionButton } from "../actions/ActionButton";
import { PageContext } from "../../auth/PageContext";
import { isDownvoteEnabledSelector } from "../../auth/siteSlice";
import { bounceAnimationOnTransition, bounceMs } from "../../shared/animations";
import { useTransition } from "react-transition-state";
import { ImpactStyle } from "@capacitor/haptics";
import useHapticFeedback from "../../../helpers/useHapticFeedback";
import useAppToast from "../../../helpers/useAppToast";
import { styled } from "@linaria/react";
import { getVoteErrorMessage } from "../../../helpers/lemmyErrors";
import {
  VOTE_COLORS,
  bgColorToVariable,
} from "../../settings/appearance/themes/votesTheme/VotesTheme";
import { PostView } from "lemmy-js-client";

const InactiveItem = styled(ActionButton)`
  ${bounceAnimationOnTransition}
`;

const ActiveItem = styled(InactiveItem)<{
  activeColor: string;
}>`
  background: ${({ activeColor }) => activeColor};
  color: var(--ion-color-primary-contrast);
`;

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
  const votesTheme = useAppSelector(
    (state) => state.settings.appearance.votesTheme,
  );

  const postVotesById = useAppSelector((state) => state.post.postVotesById);
  const myVote = postVotesById[post.post.id];

  const [state, toggle] = useTransition({
    timeout: bounceMs,
  });

  const icon = (() => {
    switch (type) {
      case "down":
        return arrowDownSharp;
      case "up":
        return arrowUpSharp;
    }
  })();

  const selectedVote = (() => {
    switch (type) {
      case "down":
        return -1;
      case "up":
        return 1;
    }
  })();

  const activeColor = (() => {
    switch (type) {
      case "up":
        return bgColorToVariable(VOTE_COLORS.UPVOTE[votesTheme]);
      case "down":
        return bgColorToVariable(VOTE_COLORS.DOWNVOTE[votesTheme]);
    }
  })();

  const on = myVote === selectedVote;

  useEffect(() => {
    if (!on) toggle(false);
  }, [on, toggle]);

  if (type === "down" && !downvoteAllowed) {
    return undefined;
  }

  const Item = on ? ActiveItem : InactiveItem;

  return (
    <Item
      activeColor={activeColor}
      className={state.status}
      onClick={async (e) => {
        e.stopPropagation();

        vibrate({ style: ImpactStyle.Light });

        if (presentLoginIfNeeded()) return;

        if (!on) {
          toggle(true);
        }

        try {
          await dispatch(
            voteOnPost(post, myVote === selectedVote ? 0 : selectedVote),
          );
        } catch (error) {
          presentToast({
            color: "danger",
            message: getVoteErrorMessage(error),
          });

          throw error;
        }
      }}
    >
      <IonIcon icon={icon} />
    </Item>
  );
}
