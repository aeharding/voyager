import { ImpactStyle } from "@capacitor/haptics";
import { use } from "react";
import { CommentView } from "threadiverse";
import { PostView } from "threadiverse";

import { SharedDialogContext } from "#/features/auth/SharedDialogContext";
import { isDownvoteEnabledSelector } from "#/features/auth/siteSlice";
import { voteOnComment } from "#/features/comment/commentSlice";
import { voteOnPost } from "#/features/post/postSlice";
import { getVoteErrorMessage } from "#/helpers/lemmyErrors";
import { downvotesDisabled } from "#/helpers/toastMessages";
import useAppToast from "#/helpers/useAppToast";
import useHapticFeedback from "#/helpers/useHapticFeedback";
import { useAppSelector } from "#/store";
import { useAppDispatch } from "#/store";

export function useVote(item: PostView | CommentView) {
  const presentToast = useAppToast();
  const dispatch = useAppDispatch();
  const canDownvote = useAppSelector(isDownvoteEnabledSelector);

  const { presentLoginIfNeeded } = use(SharedDialogContext);
  const vibrate = useHapticFeedback();

  const storeVote = useAppSelector((state) =>
    "comment" in item
      ? state.comment.commentVotesById[item.comment.id]
      : state.post.postVotesById[item.post.id],
  );

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

  return {
    myVote: storeVote ?? (item.my_vote as -1 | 0 | 1 | undefined) ?? 0,
    onVote,
  };
}
