import {
  BanFromCommunity,
  BanFromCommunitySupportParameters,
  providerSupports,
  ThreadiverseMode,
  UnsupportedError,
} from "threadiverse";

export interface CommunityBanClient {
  banFromCommunity(payload: BanFromCommunity): Promise<unknown>;
  supports(
    endpoint: "banFromCommunity",
    parameters: BanFromCommunitySupportParameters,
  ): Promise<boolean>;
}

/**
 * Whether the active provider can remove (or restore) all of a user's
 * community content as part of a ban mutation.
 */
export function supportsCommunityBanContentAction(
  mode: ThreadiverseMode | null | undefined,
): boolean {
  if (!mode) return false;

  return providerSupports(mode, "banFromCommunity", {
    remove_or_restore_data: true,
  });
}

/**
 * Execute a community ban only when the provider can honor the complete
 * payload and its client is still selected. Returns whether the remote
 * mutation ran, so callers can skip local updates for a stale preflight.
 */
export async function banFromCommunityWithCapabilities(
  client: CommunityBanClient,
  payload: Omit<BanFromCommunity, "ban"> &
    Partial<Pick<BanFromCommunity, "ban">>,
  isCurrentClient: () => boolean,
): Promise<boolean> {
  if (!isCurrentClient()) return false;

  const supported = await client.supports("banFromCommunity", payload);

  // Discovery is asynchronous. Do not mutate through the old account's
  // client if the user changed accounts or instances while it was in flight.
  if (!isCurrentClient()) return false;

  if (!supported) {
    throw new UnsupportedError(
      payload.remove_or_restore_data
        ? "Removing or restoring user content with a community ban is not supported on this server"
        : "Community bans are not supported on this server",
    );
  }

  await client.banFromCommunity({
    ban: true,
    ...payload,
  });

  return true;
}
