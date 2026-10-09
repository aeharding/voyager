import { describe, expect, it, vi } from "vitest";

import {
  getFeedKeyboardNavigationDirection,
  shouldIgnoreFeedKeyboardNavigation,
} from "./useFeedKeyboardNavigation";

function keyboardEventFrom(target: Element, key = "j") {
  let event: KeyboardEvent | undefined;
  const listener = (currentEvent: Event) => {
    event = currentEvent as KeyboardEvent;
  };

  target.addEventListener("keydown", listener, { once: true });
  target.dispatchEvent(
    new KeyboardEvent("keydown", { bubbles: true, composed: true, key }),
  );

  return event!;
}

describe("getFeedKeyboardNavigationDirection", () => {
  it.each([
    ["j", "next"],
    ["J", "next"],
    ["ArrowDown", "next"],
    ["k", "previous"],
    ["K", "previous"],
    ["ArrowUp", "previous"],
  ] as const)("maps %s to %s", (key, direction) => {
    expect(
      getFeedKeyboardNavigationDirection({
        altKey: false,
        ctrlKey: false,
        key,
        metaKey: false,
      }),
    ).toBe(direction);
  });

  it("ignores modified and unrelated keys", () => {
    expect(
      getFeedKeyboardNavigationDirection({
        altKey: false,
        ctrlKey: true,
        key: "j",
        metaKey: false,
      }),
    ).toBeUndefined();
    expect(
      getFeedKeyboardNavigationDirection({
        altKey: false,
        ctrlKey: false,
        key: "Enter",
        metaKey: false,
      }),
    ).toBeUndefined();
  });
});

describe("shouldIgnoreFeedKeyboardNavigation", () => {
  it("ignores events from editable and interactive elements", () => {
    const input = document.createElement("input");
    const button = document.createElement("button");

    expect(shouldIgnoreFeedKeyboardNavigation(keyboardEventFrom(input))).toBe(
      true,
    );
    expect(shouldIgnoreFeedKeyboardNavigation(keyboardEventFrom(button))).toBe(
      true,
    );
  });

  it("allows events from non-interactive content", () => {
    const content = document.createElement("div");

    expect(shouldIgnoreFeedKeyboardNavigation(keyboardEventFrom(content))).toBe(
      false,
    );
  });

  it("ignores events while an Ionic overlay is presented", () => {
    const querySelector = vi
      .spyOn(document, "querySelector")
      .mockReturnValue(document.body);

    expect(
      shouldIgnoreFeedKeyboardNavigation(keyboardEventFrom(document.body)),
    ).toBe(true);

    querySelector.mockRestore();
  });
});
