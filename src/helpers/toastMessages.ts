import { ToastOptions } from "@ionic/core";

export const voteError: ToastOptions = {
  message: "Problem voting. Please try again.",
  duration: 3500,
  position: "bottom",
  color: "danger",
};

export const downvotesDisabled: ToastOptions = {
  message: "Downvotes have been disabled by your server admins.",
  duration: 3500,
  position: "bottom",
  color: "warning",
};

export const saveError: ToastOptions = {
  message: "Problem bookmarking. Please try again.",
  duration: 3500,
  position: "bottom",
  color: "danger",
};

export const allNSFWHidden: ToastOptions = {
  message: "All NSFW content is now hidden for your account.",
  duration: 3500,
  position: "bottom",
  color: "success",
};

export const problemBlockingUser: ToastOptions = {
  message: "Problem blocking user. Please try again.",
  duration: 3500,
  position: "bottom",
  color: "danger",
};

export function buildBlocked(blocked: boolean, handle: string): ToastOptions {
  return {
    message: `${handle} has been ${blocked ? "blocked" : "unblocked"}`,
    duration: 3500,
    position: "bottom",
    color: "success",
  };
}

export function buildProblemSubscribing(
  isSubscribed: boolean,
  community: string
): ToastOptions {
  return {
    message: `Problem ${
      isSubscribed ? "unsubscribing from" : "subscribing to"
    } c/${community}. Please try again.`,
    duration: 3500,
    position: "bottom",
    color: "danger",
  };
}

export function buildSuccessSubscribing(
  isSubscribed: boolean,
  community: string
): ToastOptions {
  return {
    message: `${
      isSubscribed ? "Unsubscribed from" : "Subscribed to"
    } c/${community}.`,
    duration: 3500,
    position: "bottom",
    color: "success",
  };
}
