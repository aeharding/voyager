import { describe, expect, it, vi } from "vitest";

import { isNative, isTauri } from "#/helpers/device";

const mocks = vi.hoisted(() => ({
  nativeFetch: vi.fn(),
  tauriFetch: vi.fn(),
}));

// nativeFetch touches window.Capacitor at module load (absent in jsdom)
vi.mock("./nativeFetch", () => ({
  default: mocks.nativeFetch,
  getServerUrl: undefined,
}));

vi.mock("@tauri-apps/plugin-http", () => ({ fetch: mocks.tauriFetch }));

vi.mock("#/helpers/device", () => ({
  isNative: vi.fn(),
  isTauri: vi.fn(),
}));

async function loadPlatformFetch() {
  vi.resetModules();
  return (await import("./platformFetch")).default;
}

describe("platformFetch", () => {
  it("uses the capacitor fetch shim on native", async () => {
    vi.mocked(isNative).mockReturnValue(true);
    vi.mocked(isTauri).mockReturnValue(false);

    expect(await loadPlatformFetch()).toBe(mocks.nativeFetch);
  });

  it("uses the tauri http plugin fetch on desktop", async () => {
    vi.mocked(isNative).mockReturnValue(false);
    vi.mocked(isTauri).mockReturnValue(true);

    expect(await loadPlatformFetch()).toBe(mocks.tauriFetch);
  });

  it("uses plain fetch on web", async () => {
    vi.mocked(isNative).mockReturnValue(false);
    vi.mocked(isTauri).mockReturnValue(false);

    const platformFetch = await loadPlatformFetch();

    expect(platformFetch).not.toBe(mocks.nativeFetch);
    expect(platformFetch).not.toBe(mocks.tauriFetch);
    expect(platformFetch).toBeTypeOf("function");
  });
});
