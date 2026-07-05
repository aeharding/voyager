import { describe, expect, it, vi } from "vitest";

import { buildBaseHeaders } from "./client";

// nativeFetch touches window.Capacitor at module load (absent in jsdom)
vi.mock("./nativeFetch", () => ({ default: vi.fn(), getServerUrl: undefined }));

describe("buildBaseHeaders", () => {
  it("sends x-cap-user-agent on native Android (survives webview UA stripping)", () => {
    expect(buildBaseHeaders({ android: true, native: true })).toEqual({
      ["User-Agent"]: "VoyagerApp/1.0",
      ["x-cap-user-agent"]: "VoyagerApp/1.0",
    });
  });

  it("does not send x-cap-user-agent on web/PWA, even on Android", () => {
    expect(buildBaseHeaders({ android: true, native: false })).toEqual({
      ["User-Agent"]: "VoyagerApp/1.0",
    });
  });

  it("does not send x-cap-user-agent on native iOS", () => {
    expect(buildBaseHeaders({ android: false, native: true })).toEqual({
      ["User-Agent"]: "VoyagerApp/1.0",
    });
  });
});
