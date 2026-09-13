import {
  providerSupports,
  ThreadiverseMode,
  UnsupportedError,
} from "threadiverse";
import { describe, expect, it, vi } from "vitest";

import {
  banFromCommunityWithCapabilities,
  CommunityBanClient,
  supportsCommunityBanContentAction,
} from "./communityBanCapabilities";

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
}

function buildClient(supported: boolean): CommunityBanClient {
  return {
    banFromCommunity: vi.fn().mockResolvedValue(undefined),
    supports: vi.fn().mockResolvedValue(supported),
  };
}

function buildPieFedClient(): CommunityBanClient {
  return {
    banFromCommunity: vi.fn().mockResolvedValue(undefined),
    supports: vi.fn((endpoint, parameters) =>
      Promise.resolve(providerSupports("piefed", endpoint, parameters)),
    ),
  };
}

describe("supportsCommunityBanContentAction", () => {
  it.each<ThreadiverseMode>(["lemmyv0", "lemmyv1"])(
    "enables the remove-content control for %s",
    (mode) => {
      expect(supportsCommunityBanContentAction(mode)).toBe(true);
    },
  );

  it("disables the remove-content control for PieFed", () => {
    expect(supportsCommunityBanContentAction("piefed")).toBe(false);
  });

  it("keeps the control disabled until provider discovery completes", () => {
    expect(supportsCommunityBanContentAction(undefined)).toBe(false);
    expect(supportsCommunityBanContentAction(null)).toBe(false);
  });
});

describe("banFromCommunityWithCapabilities", () => {
  it.each([undefined, false])(
    "rejects PieFed's unsupported remove/restore action when ban is %s",
    async (ban) => {
      const client = buildPieFedClient();
      const payload = {
        ban,
        community_id: 1,
        person_id: 2,
        remove_or_restore_data: true,
      };

      await expect(
        banFromCommunityWithCapabilities(client, payload, () => true),
      ).rejects.toThrow(UnsupportedError);

      expect(client.supports).toHaveBeenCalledWith("banFromCommunity", payload);
      expect(client.banFromCommunity).not.toHaveBeenCalled();
    },
  );

  it.each([undefined, false])(
    "allows a supported plain ban when remove_or_restore_data is %s",
    async (remove_or_restore_data) => {
      const client = buildPieFedClient();
      const payload = {
        community_id: 1,
        person_id: 2,
        remove_or_restore_data,
      };

      await expect(
        banFromCommunityWithCapabilities(client, payload, () => true),
      ).resolves.toBe(true);

      expect(client.supports).toHaveBeenCalledWith("banFromCommunity", payload);
      expect(client.banFromCommunity).toHaveBeenCalledWith({
        ban: true,
        ...payload,
      });
    },
  );

  it("preserves an unban while preflighting the exact payload", async () => {
    const client = buildClient(true);
    const payload = {
      ban: false,
      community_id: 1,
      person_id: 2,
    };

    await expect(
      banFromCommunityWithCapabilities(client, payload, () => true),
    ).resolves.toBe(true);

    expect(client.supports).toHaveBeenCalledWith("banFromCommunity", payload);
    expect(client.banFromCommunity).toHaveBeenCalledWith(payload);
  });

  it("does not preflight a client that is already stale", async () => {
    const client = buildClient(true);

    await expect(
      banFromCommunityWithCapabilities(
        client,
        { community_id: 1, person_id: 2 },
        () => false,
      ),
    ).resolves.toBe(false);

    expect(client.supports).not.toHaveBeenCalled();
    expect(client.banFromCommunity).not.toHaveBeenCalled();
  });

  it.each([true, false])(
    "ignores a preflight result of %s after the selected client changes",
    async (supported) => {
      const supportResult = deferred<boolean>();
      const client = buildClient(true);
      vi.mocked(client.supports).mockReturnValue(supportResult.promise);
      let current = true;

      const result = banFromCommunityWithCapabilities(
        client,
        { community_id: 1, person_id: 2 },
        () => current,
      );
      await vi.waitFor(() => expect(client.supports).toHaveBeenCalledOnce());

      current = false;
      supportResult.resolve(supported);

      await expect(result).resolves.toBe(false);
      expect(client.banFromCommunity).not.toHaveBeenCalled();
    },
  );
});
