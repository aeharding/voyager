import type { ThreadiverseClient } from "threadiverse";

export type RegistrationSupport = "stale" | "supported" | "unsupported";

/**
 * Preflight signup support without applying a result to a client selection
 * that changed while capability discovery was in flight.
 */
export async function preflightRegistrationSupport(
  client: Pick<ThreadiverseClient, "supports">,
  isCurrentClient: () => boolean,
): Promise<RegistrationSupport> {
  if (!isCurrentClient()) return "stale";

  const supported = await client.supports("register");

  if (!isCurrentClient()) return "stale";

  return supported ? "supported" : "unsupported";
}
