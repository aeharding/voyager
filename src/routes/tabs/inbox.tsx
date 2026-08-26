import route from "#/routes/common/Route";
import BoxesPage from "#/routes/pages/inbox/BoxesPage";
import InboxAuthRequired from "#/routes/pages/inbox/InboxAuthRequired";
import InboxPage from "#/routes/pages/inbox/InboxPage";
import MentionsPage from "#/routes/pages/inbox/MentionsPage";
import MessagesPage from "#/routes/pages/inbox/MessagesPage";
import RepliesPage from "#/routes/pages/inbox/RepliesPage";

import anyPaneInbox from "./anyPaneInbox";

export default [
  route("/inbox", <BoxesPage />),
  route(
    "/inbox/all",
    <InboxAuthRequired>
      <InboxPage showRead />
    </InboxAuthRequired>,
  ),
  route(
    "/inbox/unread",
    <InboxAuthRequired>
      <InboxPage />
    </InboxAuthRequired>,
  ),
  route(
    "/inbox/mentions",
    <InboxAuthRequired>
      <MentionsPage />
    </InboxAuthRequired>,
  ),
  route(
    "/inbox/comment-replies",
    <InboxAuthRequired>
      <RepliesPage type="Comment" />
    </InboxAuthRequired>,
  ),
  route(
    "/inbox/post-replies",
    <InboxAuthRequired>
      <RepliesPage type="Post" />
    </InboxAuthRequired>,
  ),
  route(
    "/inbox/messages",
    <InboxAuthRequired>
      <MessagesPage />
    </InboxAuthRequired>,
  ),
  ...anyPaneInbox,
];
