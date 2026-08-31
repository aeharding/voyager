import type { ThreadiverseClient } from "threadiverse";
import { describe, expect, it, vi } from "vitest";

import { preflightRegistrationSupport } from "./registrationSupport";

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
}

function createClient(supported: boolean) {
  const supports = vi.fn(async () => supported);

  return {
    client: { supports } as unknown as Pick<ThreadiverseClient, "supports">,
    supports,
  };
}

describe("preflightRegistrationSupport", () => {
  it.each([
    [true, "supported"],
    [false, "unsupported"],
  ] as const)("maps register support %s to %s", async (supported, expected) => {
    const { client, supports } = createClient(supported);

    await expect(
      preflightRegistrationSupport(client, () => true),
    ).resolves.toBe(expected);
    expect(supports).toHaveBeenCalledExactlyOnceWith("register");
  });

  it("does not query a client whose selection is already stale", async () => {
    const { client, supports } = createClient(true);

    await expect(
      preflightRegistrationSupport(client, () => false),
    ).resolves.toBe("stale");
    expect(supports).not.toHaveBeenCalled();
  });

  it.each([true, false])(
    "ignores a result of %s after the selected client changes",
    async (supported) => {
      const result = deferred<boolean>();
      const supports = vi.fn(() => result.promise);
      const client = {
        supports,
      } as unknown as Pick<ThreadiverseClient, "supports">;
      let current = true;

      const preflight = preflightRegistrationSupport(client, () => current);

      expect(supports).toHaveBeenCalledWith("register");
      current = false;
      result.resolve(supported);

      await expect(preflight).resolves.toBe("stale");
    },
  );
});
