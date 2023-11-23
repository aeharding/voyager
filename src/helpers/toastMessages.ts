import { checkmark, close } from "ionicons/icons";
import { AppToastOptions } from "./useAppToast";

export const voteError: AppToastOptions = {
  message: "Problem voting. Please try again.",
  color: "danger",
};

export const downvotesDisabled: AppToastOptions = {
  message: "Downvotes have been disabled by your server admins.",
  color: "warning",
};

export const saveSuccess: AppToastOptions = {
  message: "Saved!",
  color: "primary",
  position: "top",
  icon: checkmark,
  centerText: true,
};

export const saveError: AppToastOptions = {
  message: "Problem bookmarking. Please try again.",
  color: "danger",
};

export const allNSFWHidden: AppToastOptions = {
  message: "All NSFW content is now hidden for your account.",
  color: "success",
};

export const problemBlockingUser: AppToastOptions = {
  message: "Problem blocking user. Please try again.",
  color: "danger",
};

export const problemFetchingTitle: AppToastOptions = {
  message: "Unable to fetch title",
  color: "warning",
};

export function buildBlocked(
  blocked: boolean,
  handle: string,
): AppToastOptions {
  return {
    message: `${handle} has been ${blocked ? "blocked" : "unblocked"}`,
    color: "success",
  };
}

export function buildProblemSubscribing(
  isSubscribed: boolean,
  community: string,
): AppToastOptions {
  return {
    message: `Problem ${
      isSubscribed ? "unsubscribing from" : "subscribing to"
    } c/${community}. Please try again.`,
    color: "danger",
  };
}

export function buildSuccessSubscribing(
  isSubscribed: boolean,
  community: string,
): AppToastOptions {
  return {
    message: `${
      isSubscribed ? "Unsubscribed from" : "Subscribed to"
    } c/${community}.`,
    color: "success",
  };
}

export const postLocked: AppToastOptions = {
  message: "Post locked by moderator",
  color: "warning",
  position: "top",
  icon: close,
  centerText: true,
};

export function buildLocked(locked: boolean): AppToastOptions {
  return {
    message: `${locked ? "Locked" : "Unlocked"} post`,
    color: "success",
    centerText: true,
    icon: checkmark,
  };
}

export function buildStickied(stickied: boolean): AppToastOptions {
  return {
    message: `${stickied ? "Stickied" : "Unstickied"} post`,
    color: "success",
    centerText: true,
    icon: checkmark,
  };
}

export const postRemoved: AppToastOptions = {
  message: "Post removed",
  color: "success",
  centerText: true,
  icon: checkmark,
};

export const postApproved: AppToastOptions = {
  message: "Post approved",
  color: "success",
  centerText: true,
  icon: checkmark,
};

export const commentRemoved: AppToastOptions = {
  message: "Comment removed",
  color: "success",
  centerText: true,
  icon: checkmark,
};

export const commentApproved: AppToastOptions = {
  message: "Comment approved",
  color: "success",
  centerText: true,
  icon: checkmark,
};

export const commentDistinguished: AppToastOptions = {
  message: "Comment distinguished",
  color: "success",
  centerText: true,
  icon: checkmark,
};
