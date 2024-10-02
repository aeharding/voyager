import { LemmyErrorType, Person } from "lemmy-js-client";

type LemmyErrorValue = LemmyErrorType["error"];

export function isLemmyError(error: unknown, lemmyErrorValue: LemmyErrorValue) {
  if (!(error instanceof Error)) return;
  return error.message === lemmyErrorValue;
}

function getErrorMessage(
  error: unknown,
  customErrorMap: (message: LemmyErrorValue) => string | undefined,
  unknownLemmyError?: string,
): string {
  if (!(error instanceof Error))
    return "Unknown error occurred, please try again.";

  const message = customErrorMap(error.message as LemmyErrorValue);

  if (message) return message;

  return unknownLemmyError ?? "Connection error, please try again.";
}

export function getLoginErrorMessage(
  error: unknown,
  instanceActorId: string,
): string {
  return getErrorMessage(error, (message) => {
    switch (message) {
      case "incorrect_totp_token":
        return "Incorrect 2nd factor code. Please try again.";
      case "not_found":
      case "couldnt_find_person" as never: // TODO lemmy 0.19 and less support
        return `User not found. Is your account on ${instanceActorId}?`;
      case "incorrect_login":
        return `Incorrect login credentials for ${instanceActorId}. Please try again.`;
      case "email_not_verified":
        return `Email not verified. Please check your inbox. Request a new verification email from https://${instanceActorId}.`;
      case "site_ban":
        return "You have been banned.";
      case "deleted":
        return "Account deleted.";
    }
  });
}

export function getVoteErrorMessage(error: unknown): string {
  return getErrorMessage(
    error,
    (message) => {
      switch (message) {
        case "invalid_bot_action":
          return "You marked your account as a bot, so you can't vote.";
      }
    },
    "Problem voting, please try again.",
  );
}

export function getBlockUserErrorMessage(
  error: unknown,
  blockingUser: Person,
): string {
  return getErrorMessage(
    error,
    (message) => {
      switch (message) {
        case "cant_block_admin":
          return `${blockingUser.name} is an admin. You can't block admins.`;
      }
    },
    "Problem blocking user. Please try again.",
  );
}
