import { cleanup, render, screen } from "@testing-library/react";
import { CommentView } from "threadiverse";
import { afterEach, describe, expect, it, vi } from "vitest";

import CommentHeader from "./CommentHeader";

vi.mock("#/store", () => ({
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      settings: {
        general: { comments: { showCollapsed: false } },
        tags: { enabled: true, trackVotes: true },
      },
    }),
}));
vi.mock("#/features/share/asImage/ShareAsImage", async () => {
  const { createContext } = await import("react");
  return { ShareImageContext: createContext({ capturing: false }) };
});
vi.mock("#/routes/pages/shared/ModqueuePage", () => ({
  useInModqueue: () => false,
}));
vi.mock("#/features/labels/links/PersonLink", () => ({
  default: () => <span>alice</span>,
}));
vi.mock("#/features/labels/vote/Vote", () => ({
  default: () => <span>Comment votes</span>,
}));
vi.mock("#/features/labels/Ago", () => ({ default: () => null }));
vi.mock("#/features/labels/Edited", () => ({ default: () => null }));
vi.mock("#/features/tags/UserTag", () => ({
  default: ({
    children,
  }: {
    children: (props: {
      el: React.ReactNode;
      tag: { text: string };
    }) => React.ReactNode;
  }) =>
    children({ el: <span>Helpful user</span>, tag: { text: "Helpful user" } }),
}));
vi.mock("#/features/tags/UserScore", () => ({
  default: () => <span>User score</span>,
}));
vi.mock("./CommentEllipsis", () => ({ default: () => null }));
vi.mock("./ModActions", () => ({ default: () => null }));
vi.mock("#/features/moderation/ModqueueItemActions", () => ({
  default: () => null,
}));

afterEach(cleanup);

const commentView = {
  comment: {
    deleted: false,
    removed: false,
    published_at: "2026-01-01T00:00:00Z",
  },
  creator: {},
  post: {},
} as CommentView;

function renderHeader(showTag?: boolean) {
  return render(
    <CommentHeader
      canModerate={undefined}
      commentView={commentView}
      comment={commentView.comment}
      context={null}
      collapsed={false}
      rootIndex={undefined}
      commentEllipsisHandleRef={{ current: undefined }}
      showTag={showTag}
    />,
  );
}

describe("comment tags", () => {
  it("shows tags by default in discussions and other feeds", () => {
    renderHeader();
    expect(screen.getByText("Helpful user")).toBeTruthy();
  });

  it("hides the repeated tag without hiding the author or vote information", () => {
    renderHeader(false);
    expect(screen.queryByText("Helpful user")).toBeNull();
    expect(screen.getByText("alice")).toBeTruthy();
    expect(screen.getByText("User score")).toBeTruthy();
    expect(screen.getByText("Comment votes")).toBeTruthy();
  });
});
