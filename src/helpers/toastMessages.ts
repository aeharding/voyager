import { checkmark } from "ionicons/icons";
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
  color: "danger",
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
