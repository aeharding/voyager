import { render } from "@testing-library/react";
import { albums, chatbubble, hammer, mail, personCircle } from "ionicons/icons";
import { ReactNode } from "react";
import { Provider } from "react-redux";
import { NotificationView } from "threadiverse";
import { describe, expect, it } from "vitest";

import store from "#/store";

import {
  getInboxItemBody,
  getInboxItemHeader,
  getInboxItemIcon,
  getInboxItemLink,
  getInboxItemSourceUrl,
} from "./inboxItemContents";

const creator = {
  name: "Alice",
  ap_id: "https://example.com/u/Alice",
  local: true,
};
const community = {
  name: "test",
  title: "Test",
  ap_id: "https://example.com/c/test",
  local: true,
};
const post = {
  id: 42,
  name: "My Post Title",
  body: "Post body text",
  ap_id: "https://example.com/post/42",
};
const comment = {
  id: 7,
  content: "Comment content",
  path: "0.7",
  post_id: 42,
  ap_id: "https://example.com/comment/7",
};

function makeNotification(
  kind: NotificationView["notification"]["kind"],
  data: NotificationView["data"],
): NotificationView {
  return {
    notification: {
      id: 1,
      kind,
      published_at: "2024-01-01T00:00:00.000Z",
      read: false,
      recipient_id: 1,
      creator_id: 2,
    },
    data,
  };
}

const commentData = (overrides: Record<string, unknown> = {}) =>
  ({
    type_: "comment",
    creator,
    community,
    post,
    comment: { ...comment, ...overrides },
    subscribed: "NotSubscribed",
  }) as unknown as NotificationView["data"];

const postData = (overrides: Record<string, unknown> = {}) =>
  ({
    type_: "post",
    creator,
    community,
    post: { ...post, ...overrides },
    subscribed: "NotSubscribed",
  }) as unknown as NotificationView["data"];

const privateMessageData = () =>
  ({
    type_: "private_message",
    creator,
    recipient: creator,
    private_message: {
      id: 3,
      content: "PM content",
      ap_id: "https://example.com/pm/3",
    },
  }) as unknown as NotificationView["data"];

const modActionData = () =>
  ({
    type_: "mod_action",
    modlog: {
      id: 9,
      kind: "mod_warn_comment",
      published_at: "2024-01-01T00:00:00.000Z",
      is_revert: false,
      reason: "Be nice",
    },
    target_community: community,
    target_comment: comment,
    moderator: creator,
  }) as unknown as NotificationView["data"];

// isPostReply keys off path depth: two segments = reply to a post.
const postReply = makeNotification("reply", commentData({ path: "0.7" }));
const commentReply = makeNotification("reply", commentData({ path: "0.7.13" }));

function textOf(node: ReactNode): string {
  const { container } = render(<Provider store={store}>{node}</Provider>);
  return (container.textContent ?? "").replace(/\s+/g, " ").trim();
}

describe("getInboxItemHeader", () => {
  it("reply to a post", () => {
    expect(textOf(getInboxItemHeader(postReply))).toBe(
      "Alice replied to your post My Post Title",
    );
  });

  it("reply to a comment", () => {
    expect(textOf(getInboxItemHeader(commentReply))).toBe(
      "Alice replied to your comment in My Post Title",
    );
  });

  it("mention in a comment", () => {
    const item = makeNotification("mention", commentData());
    expect(textOf(getInboxItemHeader(item))).toBe(
      "Alice mentioned you on the post My Post Title",
    );
  });

  it("mention in a post", () => {
    const item = makeNotification("mention", postData());
    expect(textOf(getInboxItemHeader(item))).toBe(
      "Alice mentioned you on the post My Post Title",
    );
  });

  it("subscribed new comment", () => {
    const item = makeNotification("subscribed", commentData());
    expect(textOf(getInboxItemHeader(item))).toBe(
      "Alice commented on My Post Title",
    );
  });

  it("subscribed new post", () => {
    const item = makeNotification("subscribed", postData());
    expect(textOf(getInboxItemHeader(item))).toBe("Alice posted My Post Title");
  });

  it("private message", () => {
    const item = makeNotification("private_message", privateMessageData());
    expect(textOf(getInboxItemHeader(item))).toBe(
      "Alice sent you a private message",
    );
  });

  it("mod action", () => {
    const item = makeNotification("mod_action", modActionData());
    expect(textOf(getInboxItemHeader(item))).toBe(
      "Test mods sent you a warning",
    );
  });
});

describe("getInboxItemBody", () => {
  it("comment content", () => {
    const item = makeNotification("reply", commentData());
    expect(textOf(getInboxItemBody(item))).toBe("Comment content");
  });

  it("post body", () => {
    const item = makeNotification("subscribed", postData());
    expect(textOf(getInboxItemBody(item))).toBe("Post body text");
  });

  it("post without a body renders empty", () => {
    const item = makeNotification("subscribed", postData({ body: undefined }));
    expect(textOf(getInboxItemBody(item))).toBe("");
  });

  it("private message content", () => {
    const item = makeNotification("private_message", privateMessageData());
    expect(textOf(getInboxItemBody(item))).toBe("PM content");
  });

  it("mod action reason", () => {
    const item = makeNotification("mod_action", modActionData());
    expect(textOf(getInboxItemBody(item))).toBe("Be nice");
  });
});

describe("getInboxItemIcon", () => {
  it("mention", () => {
    expect(getInboxItemIcon(makeNotification("mention", commentData()))).toBe(
      personCircle,
    );
  });

  it("reply to a post uses the post icon", () => {
    expect(getInboxItemIcon(postReply)).toBe(albums);
  });

  it("reply to a comment uses the comment icon", () => {
    expect(getInboxItemIcon(commentReply)).toBe(chatbubble);
  });

  it("private message", () => {
    expect(
      getInboxItemIcon(makeNotification("private_message", privateMessageData())),
    ).toBe(mail);
  });

  it("subscribed post uses the post icon", () => {
    expect(getInboxItemIcon(makeNotification("subscribed", postData()))).toBe(
      albums,
    );
  });

  it("subscribed comment uses the comment icon", () => {
    expect(getInboxItemIcon(makeNotification("subscribed", commentData()))).toBe(
      chatbubble,
    );
  });

  it("mod action", () => {
    expect(getInboxItemIcon(makeNotification("mod_action", modActionData()))).toBe(
      hammer,
    );
  });
});

describe("getInboxItemLink", () => {
  const identity = (path: string) => path;

  it("comment links to the comment thread", () => {
    const item = makeNotification("reply", commentData());
    expect(getInboxItemLink(item, identity)).toBe("/c/test/comments/42/0.7");
  });

  it("post links to the post", () => {
    const item = makeNotification("subscribed", postData());
    expect(getInboxItemLink(item, identity)).toBe("/c/test/comments/42");
  });

  it("private message links to the conversation", () => {
    const item = makeNotification("private_message", privateMessageData());
    expect(getInboxItemLink(item, identity)).toBe("/inbox/messages/Alice");
  });

  it("mod action links to the modlog target", () => {
    const item = makeNotification("mod_action", modActionData());
    expect(getInboxItemLink(item, identity)).toBe("/c/test/comments/42/0.7");
  });
});

describe("getInboxItemSourceUrl", () => {
  it("comment ap_id", () => {
    expect(getInboxItemSourceUrl(makeNotification("reply", commentData()))).toBe(
      "https://example.com/comment/7",
    );
  });

  it("post ap_id", () => {
    expect(
      getInboxItemSourceUrl(makeNotification("subscribed", postData())),
    ).toBe("https://example.com/post/42");
  });

  it("private message has no source url", () => {
    expect(
      getInboxItemSourceUrl(
        makeNotification("private_message", privateMessageData()),
      ),
    ).toBeUndefined();
  });

  it("mod action has no source url", () => {
    expect(
      getInboxItemSourceUrl(makeNotification("mod_action", modActionData())),
    ).toBeUndefined();
  });
});
