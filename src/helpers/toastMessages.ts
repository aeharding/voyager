import { checkmark, close } from "ionicons/icons";

import { DEFAULT_TOAST_DURATION } from "./toast";
import { AppToastOptions } from "./useAppToast";

const shortFailDefaults: Omit<AppToastOptions, "message"> = {
  color: "danger",
  position: "top",
  icon: close,
};

const shortSuccessDefaults: Omit<AppToastOptions, "message"> = {
  color: "primary",
  position: "top",
  icon: checkmark,
};

const shortModSuccessDefaults: Omit<AppToastOptions, "message"> = {
  ...shortSuccessDefaults,
  color: "success",
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
};

export const saveError: AppToastOptions = {
  message: "Problem bookmarking. Please try again.",
  color: "danger",
};

export const allNSFWHidden: AppToastOptions = {
  message: "All NSFW content is now hidden for your account.",
  color: "success",
};

export const problemFetchingTitle: AppToastOptions = {
  message: "Unable to fetch title",
  color: "warning",
};

export function buildBlockedUser(blocked: boolean): AppToastOptions {
  return {
    ...shortSuccessDefaults,
    message: `User ${blocked ? "blocked" : "unblocked"}!`,
  };
}

export function buildBlockedCommunity(blocked: boolean): AppToastOptions {
  return {
    ...shortSuccessDefaults,
    message: `Community ${blocked ? "blocked" : "unblocked"}!`,
  };
}

export function buildProblemSubscribing(
  isSubscribed: boolean,
): AppToastOptions {
  return {
    ...shortFailDefaults,
    message: `Failed to ${isSubscribed ? "unsubscribe" : "subscribe"}`,
  };
}

export function buildSuccessSubscribing(
  isSubscribed: boolean,
): AppToastOptions {
  return {
    ...shortSuccessDefaults,
    message: isSubscribed ? "Unsubscribed!" : "Subscribed!",
  };
}

export function buildFavorited(favorited: boolean): AppToastOptions {
  return {
    ...shortSuccessDefaults,
    message: `${favorited ? "Unfavorited" : "Favorited"} community!`,
  };
}

export const postLocked: AppToastOptions = {
  ...shortFailDefaults,
  message: "Post locked by moderator",
  color: "warning",
};

export function buildLocked(locked: boolean): AppToastOptions {
  return {
    ...shortModSuccessDefaults,
    message: `${locked ? "Locked" : "Unlocked"} post!`,
  };
}

export function buildStickied(stickied: boolean): AppToastOptions {
  return {
    ...shortModSuccessDefaults,
    message: `${stickied ? "Stickied" : "Unstickied"} post!`,
  };
}

export const postDeleted: AppToastOptions = {
  ...shortSuccessDefaults,
  message: "Post deleted!",
};

export const postDeleteFailed: AppToastOptions = {
  ...shortFailDefaults,
  message: "Problem deleting post",
};

export const commentPosted: AppToastOptions = {
  ...shortSuccessDefaults,
  message: "Comment posted!",
};

export const commentDeleted: AppToastOptions = {
  ...shortSuccessDefaults,
  message: "Comment deleted!",
};

export const commentDeleteFailed: AppToastOptions = {
  ...shortFailDefaults,
  message: "Problem deleting comment",
};

export const postRemovedMod: AppToastOptions = {
  ...shortModSuccessDefaults,
  message: "Post removed!",
};

export const postApproved: AppToastOptions = {
  ...shortModSuccessDefaults,
  message: "Post approved!",
};

export const postRestored: AppToastOptions = {
  ...shortModSuccessDefaults,
  message: "Post restored!",
};

export const commentRemovedMod: AppToastOptions = {
  ...shortModSuccessDefaults,
  message: "Comment removed!",
};

export const commentApproved: AppToastOptions = {
  ...shortModSuccessDefaults,
  message: "Comment approved!",
};

export const commentRestored: AppToastOptions = {
  ...shortModSuccessDefaults,
  message: "Comment restored!",
};

export const commentDistinguished: AppToastOptions = {
  ...shortModSuccessDefaults,
  message: "Comment distinguished",
};

export function buildBanned(banned: boolean): AppToastOptions {
  return {
    ...shortModSuccessDefaults,
    message: banned ? "Banned user" : "Unbanned user",
    fullscreen: true,
  };
}

export function buildBanFailed(banned: boolean): AppToastOptions {
  return {
    ...shortFailDefaults,
    message: `Failed to ${banned ? "ban user" : "unban user"}`,
    fullscreen: true,
  };
}

export function buildResolvePostFailed(instance: string): AppToastOptions {
  return {
    ...shortFailDefaults,
    message: `Failed to resolve post on ${instance}`,
  };
}

export function buildResolveCommentFailed(instance: string): AppToastOptions {
  return {
    ...shortFailDefaults,
    message: `Failed to resolve comment on ${instance}`,
  };
}

export const loginSuccess: AppToastOptions = {
  ...shortSuccessDefaults,
  message: "Logged in!",
};

export const crosspostSuccess: AppToastOptions = {
  ...shortSuccessDefaults,
  message: "Crossposted!",
};

export const crosspostFailed: AppToastOptions = {
  ...shortFailDefaults,
  message: "Failed to create crosspost",
};

export function buildReported(type: string): AppToastOptions {
  return {
    ...shortSuccessDefaults,
    message: `${type} reported!`,
  };
}

export const commentEdited: AppToastOptions = {
  ...shortSuccessDefaults,
  message: "Comment edited!",
};

export function buildPostCreated(
  onClick: AppToastOptions["onClick"],
): AppToastOptions {
  return {
    ...shortSuccessDefaults,
    onClick,
    duration: DEFAULT_TOAST_DURATION * 1.5,
    message: "Posted! Tap to view.",
  };
}

export const postEdited: AppToastOptions = {
  ...shortSuccessDefaults,
  message: "Post edited!",
};

export const messageSent: AppToastOptions = {
  ...shortSuccessDefaults,
  message: "Message sent!",
};

export const alreadyHere: AppToastOptions = {
  ...shortSuccessDefaults,
  message: "You’re already here!",
};

export const photoSaved: AppToastOptions = {
  ...shortSuccessDefaults,
  message: "Photo saved!",
  fullscreen: true,
};

export const photoCopied: AppToastOptions = {
  ...shortSuccessDefaults,
  message: "Photo copied to clipboard!",
  fullscreen: true,
};

export const migrateParseError: AppToastOptions = {
  message:
    "Problem parsing link. Please make sure the link you entered is correct.",
  color: "warning",
};

export const replyStubError: AppToastOptions = {
  ...shortFailDefaults,
  message: "You can’t reply to a removed comment",
  color: "warning",
};

export const randomCommunityFailed: AppToastOptions = {
  ...shortFailDefaults,
  message: "Failed to find random community",
  color: "warning",
};

export const copyClipboardSuccess: AppToastOptions = {
  ...shortSuccessDefaults,
  message: "Text copied!",
  fullscreen: true,
  position: "bottom",
};

export const copyClipboardFailed: AppToastOptions = {
  ...shortFailDefaults,
  message: "Failed to copy text",
  color: "warning",
  position: "bottom",
  fullscreen: true,
};

export const cacheClearSuccess: AppToastOptions = {
  ...shortSuccessDefaults,
  message: "Cache cleared!",
};

export const cacheClearFailed: AppToastOptions = {
  ...shortFailDefaults,
  message: "Failed to clear cache",
  color: "warning",
};

export const deepLinkFailed: AppToastOptions = {
  message:
    "Unknown URL. Voyager only accepts URLs to Lemmy content to browse in-app.",
  color: "warning",
  position: "top",
  duration: 7000,
};

export const privateMessageSendFailed: AppToastOptions = {
  message: "Message failed to send. Please try again",
  color: "danger",
};
