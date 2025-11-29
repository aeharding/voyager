import { vi } from "vitest";

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// https://github.com/jsdom/jsdom/issues/3444
global.CSSStyleSheet = class CSSStyleSheet {
  // eslint-disable-next-line no-empty-function
  replaceSync() {}
  replace() {
    return Promise.resolve(this);
  }
} as unknown as typeof CSSStyleSheet;

// Mock document.adoptedStyleSheets for Ionic/Stencil
Object.defineProperty(document, "adoptedStyleSheets", {
  configurable: true,
  get() {
    return [];
  },
  set() {
    // noop
  },
});
