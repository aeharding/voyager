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
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, reject, resolve };
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
    await expect(result).resolves.toBe(false);

    expect(dispatch).not.toHaveBeenCalled();
  });

  it("suppresses an old client's rejected ban after an account switch", async () => {
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
    endpointResult.reject(new Error("old client failed"));

    await expect(result).resolves.toBe(false);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("suppresses an old client's rejected capability check after an account switch", async () => {
    const supportResult = deferred<boolean>();
    const first = createClient();
    const second = createClient();
    first.supports.mockReturnValue(supportResult.promise);
    selectedClient.current = first.client;
    const dispatch = vi.fn() as unknown as AppDispatch;

    const result = banUser({
      community_id: 1,
      person_id: 2,
    })(dispatch, () => state);

    await vi.waitFor(() => expect(first.supports).toHaveBeenCalledOnce());

    selectedClient.current = second.client;
    supportResult.reject(new Error("old discovery failed"));

    await expect(result).resolves.toBe(false);
    expect(first.banFromCommunity).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("propagates a failure from the active client", async () => {
    const failure = new Error("active client failed");
    const first = createClient();
    first.banFromCommunity.mockRejectedValue(failure);
    selectedClient.current = first.client;
    const dispatch = vi.fn() as unknown as AppDispatch;

    await expect(
      banUser({ community_id: 1, person_id: 2 })(dispatch, () => state),
    ).rejects.toBe(failure);

    expect(dispatch).not.toHaveBeenCalled();
  });

  it("reports cancellation when no client is selected", async () => {
    selectedClient.current = undefined as unknown as ThreadiverseClient;
    const dispatch = vi.fn() as unknown as AppDispatch;

    await expect(
      banUser({ community_id: 1, person_id: 2 })(dispatch, () => state),
    ).resolves.toBe(false);

    expect(dispatch).not.toHaveBeenCalled();
  });

  it("records a default ban and reports execution", async () => {
    const { client } = createClient();
    selectedClient.current = client;
    const dispatch = vi.fn() as unknown as AppDispatch;

    await expect(
      banUser({ community_id: 1, person_id: 2 })(dispatch, () => state),
    ).resolves.toBe(true);

    expect(dispatch).toHaveBeenCalledWith(
      updateBanned({ banned: true, communityId: 1, userId: 2 }),
    );
  });

  it("records an unban only while its client remains selected", async () => {
    const { client } = createClient();
    selectedClient.current = client;
    const dispatch = vi.fn() as unknown as AppDispatch;

    await expect(
      banUser({
        ban: false,
        community_id: 1,
        person_id: 2,
      })(dispatch, () => state),
    ).resolves.toBe(true);

    expect(dispatch).toHaveBeenCalledWith(
      updateBanned({ banned: false, communityId: 1, userId: 2 }),
    );
  });
});
