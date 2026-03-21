import Route from "#/routes/common/Route";
import BoxesPage from "#/routes/pages/inbox/BoxesPage";
import InboxAuthRequired from "#/routes/pages/inbox/InboxAuthRequired";
import InboxPage from "#/routes/pages/inbox/InboxPage";
import MentionsPage from "#/routes/pages/inbox/MentionsPage";
import MessagesPage from "#/routes/pages/inbox/MessagesPage";
import RepliesPage from "#/routes/pages/inbox/RepliesPage";

import anyPaneInbox from "./anyPaneInbox";

export default [
  <Route path="/inbox" element={<BoxesPage />} />,
  <Route
    path="/inbox/all"
    element={
      <InboxAuthRequired>
        <InboxPage showRead />
      </InboxAuthRequired>
    }
  />,
  <Route
    path="/inbox/unread"
    element={
      <InboxAuthRequired>
        <InboxPage />
      </InboxAuthRequired>
    }
  />,
  <Route
    path="/inbox/mentions"
    element={
      <InboxAuthRequired>
        <MentionsPage />
      </InboxAuthRequired>
    }
  />,
  <Route
    path="/inbox/comment-replies"
    element={
      <InboxAuthRequired>
        <RepliesPage type="Comment" />
      </InboxAuthRequired>
    }
  />,
  <Route
    path="/inbox/post-replies"
    element={
      <InboxAuthRequired>
        <RepliesPage type="Post" />
      </InboxAuthRequired>
    }
  />,
  <Route
    path="/inbox/messages"
    element={
      <InboxAuthRequired>
        <MessagesPage />
      </InboxAuthRequired>
    }
  />,
  ...anyPaneInbox,
];
