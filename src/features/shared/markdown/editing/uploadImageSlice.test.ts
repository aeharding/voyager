import type { ThreadiverseClient } from "threadiverse";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AppDispatch, RootState } from "#/store";

import { deletePendingImageUploads } from "./uploadImageSlice";

const getClient = vi.hoisted(() => vi.fn());

vi.mock("#/services/client", () => ({ getClient }));

const owner = {
  handle: "owner@piefed.example",
  jwt: "owner-token",
};

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
}

function createClient(supported = true) {
  const supports = vi.fn(async () => supported);
  const deleteImage = vi.fn(async (): Promise<void> => undefined);
  const client = { deleteImage, supports } as unknown as ThreadiverseClient;

  getClient.mockReturnValue(client);

  return { client, deleteImage, supports };
}

function createImage(delete_token?: string) {
  return {
    _context: "body" as const,
    _handle: owner.handle,
    delete_token,
    url: "https://piefed.example/media/image.webp",
  };
}

function createState(
  image: ReturnType<typeof createImage>,
  accounts: Array<{ handle: string; jwt?: string }> = [owner],
): RootState {
  return {
    auth: {
      accountData: {
        accounts,
        activeHandle: accounts[0]?.handle,
      },
    },
    uploadImage: { pendingSubmitImages: [image] },
  } as unknown as RootState;
}

describe("deletePendingImageUploads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("preflights and preserves the token-based Lemmy deletion path", async () => {
    const image = createImage("lemmy-delete-token");
    const state = createState(image);
    const { deleteImage, supports } = createClient();
    const dispatch = vi.fn() as unknown as AppDispatch;

    await deletePendingImageUploads()(dispatch, () => state);

    expect(getClient).toHaveBeenCalledWith("piefed.example", owner.jwt);
    expect(supports).toHaveBeenCalledWith("deleteImage", {
      delete_token: "lemmy-delete-token",
      url: image.url,
    });
    expect(deleteImage).toHaveBeenCalledWith({
      delete_token: "lemmy-delete-token",
      url: image.url,
    });
  });

  it("deletes a tokenless upload through its owning account when supported", async () => {
    const image = createImage();
    const state = createState(image, [
      { handle: "active@lemmy.example", jwt: "active-token" },
      owner,
    ]);
    const { deleteImage, supports } = createClient();
    const dispatch = vi.fn() as unknown as AppDispatch;

    await deletePendingImageUploads()(dispatch, () => state);

    expect(getClient).toHaveBeenCalledWith("piefed.example", owner.jwt);
    expect(supports).toHaveBeenCalledWith("deleteImage", {
      delete_token: "",
      url: image.url,
    });
    expect(deleteImage).toHaveBeenCalledWith({
      delete_token: "",
      url: image.url,
    });
  });

  it("skips a tokenless upload when the provider cannot delete it", async () => {
    const image = createImage();
    const state = createState(image);
    const { deleteImage, supports } = createClient(false);
    const dispatch = vi.fn() as unknown as AppDispatch;

    await deletePendingImageUploads()(dispatch, () => state);

    expect(supports).toHaveBeenCalledWith("deleteImage", {
      delete_token: "",
      url: image.url,
    });
    expect(deleteImage).not.toHaveBeenCalled();
  });

  it("does not construct a client when the upload's owning account is gone", async () => {
    const image = createImage();
    const state = createState(image, []);
    const dispatch = vi.fn() as unknown as AppDispatch;

    await deletePendingImageUploads()(dispatch, () => state);

    expect(getClient).not.toHaveBeenCalled();
  });

  it.each([
    ["tokenless", undefined],
    ["token-based", "lemmy-delete-token"],
  ] as const)(
    "does not delete a %s upload through a credential replaced during capability discovery",
    async (_label, deleteToken) => {
      const image = createImage(deleteToken);
      let state = createState(image);
      const supportResult = deferred<boolean>();
      const { deleteImage, supports } = createClient();
      supports.mockReturnValue(supportResult.promise);
      const dispatch = vi.fn() as unknown as AppDispatch;

      const result = deletePendingImageUploads()(dispatch, () => state);
      await vi.waitFor(() => expect(supports).toHaveBeenCalledOnce());

      state = createState(image, [{ ...owner, jwt: "replacement-token" }]);
      supportResult.resolve(true);
      await result;

      expect(deleteImage).not.toHaveBeenCalled();
    },
  );
});
