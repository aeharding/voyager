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

export const postRestored: AppToastOptions = {
  message: "Post restored",
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

export const commentRestored: AppToastOptions = {
  message: "Comment restored",
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

export function buildBanned(banned: boolean): AppToastOptions {
  return {
    message: banned ? "Banned user" : "Unbanned user",
    position: "top",
    color: "success",
    fullscreen: true,
    centerText: true,
    icon: checkmark,
  };
}

export function buildBanFailed(banned: boolean): AppToastOptions {
  return {
    message: `Failed to ${banned ? "ban user" : "unban user"}`,
    position: "top",
    color: "danger",
    fullscreen: true,
    centerText: true,
  };
}

export const loginSuccess: AppToastOptions = {
  message: "Login successful",
  color: "success",
  centerText: true,
  icon: checkmark,
};
