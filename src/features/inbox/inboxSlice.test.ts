import { UnsupportedError } from "threadiverse";
import type { ThreadiverseClient } from "threadiverse";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AppDispatch, RootState } from "#/store";

import { markNotificationRead, setNotificationReadStatus } from "./inboxSlice";

const selectedClient = vi.hoisted(() => ({
  current: undefined as unknown as ThreadiverseClient,
}));

vi.mock("#/features/auth/authSelectors", async (importOriginal) => ({
  ...(await importOriginal()),
  clientSelector: () => selectedClient.current,
  jwtSelector: () => "test-jwt",
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
  const markNotificationAsRead = vi.fn(async (): Promise<void> => undefined);

  return {
    client: {
      markNotificationAsRead,
      supports,
    } as unknown as ThreadiverseClient,
    markNotificationAsRead,
    supports,
  };
}

function createState(auth: object, read = false): RootState {
  return {
    auth,
    inbox: {
      readByInboxItemId: { mod_action_42: read },
    },
  } as unknown as RootState;
}

describe("markNotificationRead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an unsupported notification kind before optimistic or remote writes", async () => {
    const { client, markNotificationAsRead, supports } = createClient();
    supports.mockResolvedValue(false);
    selectedClient.current = client;

    const state = createState({ activeHandle: "me@piefed.example" });
    const dispatch = vi.fn() as unknown as AppDispatch;

    await expect(
      markNotificationRead({ kind: "mod_action", notificationId: 42 }, true)(
        dispatch,
        () => state,
      ),
    ).rejects.toBeInstanceOf(UnsupportedError);

    expect(supports).toHaveBeenCalledWith("markNotificationAsRead", {
      kind: "mod_action",
      notification_id: 42,
      read: true,
    });
    expect(dispatch).not.toHaveBeenCalled();
    expect(markNotificationAsRead).not.toHaveBeenCalled();
  });

  it.each([true, false])(
    "does not apply stale state after an account switch when preflight resolves %s",
    async (supported) => {
      const supportResult = deferred<boolean>();
      const first = createClient();
      const second = createClient();
      first.supports.mockReturnValue(supportResult.promise);
      selectedClient.current = first.client;

      let state = createState({ activeHandle: "first@example.com" });
      const dispatch = vi.fn() as unknown as AppDispatch;
      const result = markNotificationRead(
        { kind: "reply", notificationId: 42 },
        true,
      )(dispatch, () => state);

      expect(dispatch).not.toHaveBeenCalled();

      state = createState({ activeHandle: "second@example.com" });
      selectedClient.current = second.client;
      supportResult.resolve(supported);
      await expect(result).resolves.toBe(false);

      expect(dispatch).not.toHaveBeenCalled();
      expect(first.markNotificationAsRead).not.toHaveBeenCalled();
      expect(second.markNotificationAsRead).not.toHaveBeenCalled();
    },
  );

  it("does not roll a failed old request back into a newly selected account", async () => {
    const endpointResult = deferred<void>();
    const first = createClient();
    const second = createClient();
    first.markNotificationAsRead.mockReturnValue(endpointResult.promise);
    selectedClient.current = first.client;

    let state = createState({ activeHandle: "first@example.com" });
    const dispatch = vi.fn() as unknown as AppDispatch;
    const result = markNotificationRead(
      { kind: "reply", notificationId: 42 },
      true,
    )(dispatch, () => state);

    await vi.waitFor(() => {
      expect(first.markNotificationAsRead).toHaveBeenCalledOnce();
    });
    expect(dispatch).toHaveBeenCalledWith(
      setNotificationReadStatus({
        kind: "reply",
        notificationId: 42,
        read: true,
      }),
    );

    state = createState({ activeHandle: "second@example.com" });
    selectedClient.current = second.client;
    const endpointError = new Error("request failed");
    endpointResult.reject(endpointError);

    await expect(result).resolves.toBe(false);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it("suppresses a failed old preflight after an account switch", async () => {
    const supportResult = deferred<boolean>();
    const first = createClient();
    const second = createClient();
    first.supports.mockReturnValue(supportResult.promise);
    selectedClient.current = first.client;

    let state = createState({ activeHandle: "first@example.com" });
    const dispatch = vi.fn() as unknown as AppDispatch;
    const result = markNotificationRead(
      { kind: "reply", notificationId: 42 },
      true,
    )(dispatch, () => state);

    await vi.waitFor(() => expect(first.supports).toHaveBeenCalledOnce());

    state = createState({ activeHandle: "second@example.com" });
    selectedClient.current = second.client;
    supportResult.reject(new Error("old discovery failed"));

    await expect(result).resolves.toBe(false);
    expect(dispatch).not.toHaveBeenCalled();
    expect(first.markNotificationAsRead).not.toHaveBeenCalled();
  });

  it("rolls back and propagates a failed request for the active account", async () => {
    const endpointError = new Error("active request failed");
    const first = createClient();
    first.markNotificationAsRead.mockRejectedValue(endpointError);
    selectedClient.current = first.client;

    const state = createState({ activeHandle: "first@example.com" });
    const dispatch = vi.fn() as unknown as AppDispatch;

    await expect(
      markNotificationRead({ kind: "reply", notificationId: 42 }, true)(
        dispatch,
        () => state,
      ),
    ).rejects.toBe(endpointError);

    expect(dispatch).toHaveBeenNthCalledWith(
      1,
      setNotificationReadStatus({
        kind: "reply",
        notificationId: 42,
        read: true,
      }),
    );
    expect(dispatch).toHaveBeenNthCalledWith(
      2,
      setNotificationReadStatus({
        kind: "reply",
        notificationId: 42,
        read: false,
      }),
    );
  });

  it("does not refresh counts for an old request after an account switch", async () => {
    const endpointResult = deferred<void>();
    const first = createClient();
    const second = createClient();
    first.markNotificationAsRead.mockReturnValue(endpointResult.promise);
    selectedClient.current = first.client;

    let state = createState({ activeHandle: "first@example.com" });
    const dispatch = vi.fn() as unknown as AppDispatch;
    const result = markNotificationRead(
      { kind: "reply", notificationId: 42 },
      true,
    )(dispatch, () => state);

    await vi.waitFor(() => {
      expect(first.markNotificationAsRead).toHaveBeenCalledOnce();
    });
    expect(dispatch).toHaveBeenCalledTimes(1);

    state = createState({ activeHandle: "second@example.com" });
    selectedClient.current = second.client;
    endpointResult.resolve();

    await expect(result).resolves.toBe(false);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});
