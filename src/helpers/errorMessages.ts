import {
  AccountDeletedError,
  BannedError,
  CantBlockAdminError,
  EmailNotVerifiedError,
  Incorrect2faError,
  IncorrectLoginError,
  InvalidBotActionError,
  NotFoundError,
  Person,
  RateLimitedError,
  RegistrationApplicationPendingError,
} from "threadiverse";

function getErrorMessage(
  error: unknown,
  customErrorMap: (error: Error) => string | undefined,
  unknownError?: string,
): string {
  if (!(error instanceof Error))
    return "Unknown error occurred, please try again.";

  // Server-level rate limiting — applies to any endpoint, not just custom-mapped ones.
  if (error instanceof RateLimitedError) {
    return "Too many requests. Please wait a moment and try again.";
  }

  const message = customErrorMap(error);

  if (message) return message;

  return unknownError ?? "Connection error, please try again.";
}

export function getLoginErrorMessage(
  error: unknown,
  instanceActorId: string,
): string {
  return getErrorMessage(error, (error) => {
    switch (true) {
      case error instanceof Incorrect2faError:
        return "Incorrect 2nd factor code. Please try again.";
      case error instanceof NotFoundError:
        return `User not found. Is your account on ${instanceActorId}?`;
      case error instanceof IncorrectLoginError:
        return `Incorrect login credentials for ${instanceActorId}. Please try again.`;
      case error instanceof EmailNotVerifiedError:
        return `Email not verified. Please check your inbox. Request a new verification email from https://${instanceActorId}.`;
      case error instanceof BannedError:
        return "You have been banned.";
      case error instanceof AccountDeletedError:
        return "Account deleted.";
      case error instanceof RegistrationApplicationPendingError:
        return "Signup approval pending, try again later.";
    }
  });
}

export function getVoteErrorMessage(error: unknown): string {
  return getErrorMessage(
    error,
    (error) => {
      if (error instanceof InvalidBotActionError)
        return "You marked your account as a bot, so you can't vote.";
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
    (error) => {
      if (error instanceof CantBlockAdminError)
        return `${blockingUser.name} is an admin. You can't block admins.`;
    },
    "Problem blocking user. Please try again.",
  );
}
