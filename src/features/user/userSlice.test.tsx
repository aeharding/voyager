import type { ThreadiverseClient } from "threadiverse";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AppDispatch, RootState } from "#/store";

import { banUser, updateBanned } from "./userSlice";

const selectedClient = vi.hoisted(() => ({
  current: undefined as unknown as ThreadiverseClient,
}));

vi.mock("#/features/auth/authSelectors", async (importOriginal) => ({
  ...(await importOriginal()),
  clientSelector: () => selectedClient.current,
}));

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
}

function createClient() {
  const supports = vi.fn(async () => true);
  const banFromCommunity = vi.fn(async (): Promise<void> => undefined);
  const client = {
    banFromCommunity,
    supports,
  } as unknown as ThreadiverseClient;

  return { banFromCommunity, client, supports };
}

const state = {} as RootState;

describe("banUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not apply an old client's completed ban after an account switch", async () => {
    const endpointResult = deferred<void>();
    const first = createClient();
    const second = createClient();
    first.banFromCommunity.mockReturnValue(endpointResult.promise);
    selectedClient.current = first.client;
    const dispatch = vi.fn() as unknown as AppDispatch;

    const result = banUser({
      community_id: 1,
      person_id: 2,
    })(dispatch, () => state);

    await vi.waitFor(() => {
      expect(first.banFromCommunity).toHaveBeenCalledOnce();
    });

    selectedClient.current = second.client;
    endpointResult.resolve();
    await result;

    expect(dispatch).not.toHaveBeenCalled();
  });

  it("records an unban only while its client remains selected", async () => {
    const { client } = createClient();
    selectedClient.current = client;
    const dispatch = vi.fn() as unknown as AppDispatch;

    await banUser({
      ban: false,
      community_id: 1,
      person_id: 2,
    })(dispatch, () => state);

    expect(dispatch).toHaveBeenCalledWith(
      updateBanned({ banned: false, communityId: 1, userId: 2 }),
    );
  });
});
