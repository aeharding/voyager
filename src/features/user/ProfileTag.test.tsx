import { configureStore } from "@reduxjs/toolkit";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { act, PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { Person } from "threadiverse";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import userTagReducer, { userTagSlice } from "#/features/tags/userTagSlice";
import { db } from "#/services/db";
import { UserTag } from "#/services/db/types";

import ProfileTag from "./ProfileTag";

vi.mock("@ionic/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@ionic/react")>()),
  IonList: ({ children }: PropsWithChildren) => <div>{children}</div>,
  IonItem: ({ children }: PropsWithChildren) => <div>{children}</div>,
  IonLabel: ({ children }: PropsWithChildren) => <div>{children}</div>,
  useIonAlert: () => [vi.fn()],
}));

vi.mock("#/store", async () => {
  const { useDispatch, useSelector } = await import("react-redux");
  return { useAppDispatch: useDispatch, useAppSelector: useSelector };
});

vi.mock("#/services/db", () => ({
  db: { fetchTagsForHandles: vi.fn() },
}));

const person = {
  name: "alice",
  ap_id: "https://example.org/u/alice",
  local: false,
} as Person;

const tag: UserTag = {
  handle: "alice@example.org",
  text: "Helpful user",
  color: "#ff0000",
  upvotes: 0,
  downvotes: 0,
};

function setup(enabled = true) {
  const store = configureStore({
    reducer: {
      userTag: userTagReducer,
      settings: () => ({ tags: { enabled } }),
    },
  });

  const view = render(
    <Provider store={store}>
      <ProfileTag person={person} />
    </Provider>,
  );

  return { store, ...view };
}

beforeEach(() => {
  vi.mocked(db.fetchTagsForHandles).mockReset();
  vi.mocked(db.fetchTagsForHandles).mockResolvedValue([]);
});

afterEach(cleanup);

describe("ProfileTag", () => {
  it("loads and displays a saved tag on a directly opened profile", async () => {
    vi.mocked(db.fetchTagsForHandles).mockResolvedValue([tag]);
    setup();

    const badge = await screen.findByText("Helpful user");

    expect(db.fetchTagsForHandles).toHaveBeenCalledWith(["alice@example.org"]);
    expect(screen.queryByText("Tags")).toBeNull();
    expect(badge.style.background).toBe("rgb(255, 0, 0)");
  });

  it("does not show an empty section for a user without tag text", async () => {
    vi.mocked(db.fetchTagsForHandles).mockResolvedValue([
      { ...tag, text: undefined },
    ]);
    const { store, container } = setup();

    await waitFor(() => {
      expect(
        typeof store.getState().userTag.tagByRemoteHandle[tag.handle],
      ).toBe("object");
    });

    expect(container.textContent).toBe("");
  });

  it("does not fetch or display tags when user tags are disabled", () => {
    const { store, container } = setup(false);
    act(() => store.dispatch(userTagSlice.actions.updateTag(tag)));

    expect(db.fetchTagsForHandles).not.toHaveBeenCalled();
    expect(container.textContent).toBe("");
  });

  it("updates the profile when a tag is edited or removed", async () => {
    vi.mocked(db.fetchTagsForHandles).mockResolvedValue([tag]);
    const { store, container } = setup();
    await screen.findByText("Helpful user");

    act(() =>
      store.dispatch(
        userTagSlice.actions.updateTag({ ...tag, text: "Updated tag" }),
      ),
    );
    expect(screen.getByText("Updated tag")).toBeTruthy();
    expect(screen.queryByText("Helpful user")).toBeNull();

    act(() => store.dispatch(userTagSlice.actions.removeTag(tag)));
    expect(container.textContent).toBe("");
  });
});
