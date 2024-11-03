/* eslint-disable react/jsx-key */
import Route from "#/routes/common/Route";
import BoxesPage from "#/routes/pages/inbox/BoxesPage";
import ConversationPage from "#/routes/pages/inbox/ConversationPage";
import InboxAuthRequired from "#/routes/pages/inbox/InboxAuthRequired";
import InboxPage from "#/routes/pages/inbox/InboxPage";
import MentionsPage from "#/routes/pages/inbox/MentionsPage";
import MessagesPage from "#/routes/pages/inbox/MessagesPage";
import RepliesPage from "#/routes/pages/inbox/RepliesPage";

export default [
  <Route exact path="/inbox">
    <BoxesPage />
  </Route>,
  <Route exact path="/inbox/all">
    <InboxAuthRequired>
      <InboxPage showRead />
    </InboxAuthRequired>
  </Route>,
  <Route exact path="/inbox/unread">
    <InboxAuthRequired>
      <InboxPage />
    </InboxAuthRequired>
  </Route>,
  <Route exact path="/inbox/mentions">
    <InboxAuthRequired>
      <MentionsPage />
    </InboxAuthRequired>
  </Route>,
  <Route exact path="/inbox/comment-replies">
    <InboxAuthRequired>
      <RepliesPage type="Comment" />
    </InboxAuthRequired>
  </Route>,
  <Route exact path="/inbox/post-replies">
    <InboxAuthRequired>
      <RepliesPage type="Post" />
    </InboxAuthRequired>
  </Route>,
  <Route exact path="/inbox/messages">
    <InboxAuthRequired>
      <MessagesPage />
    </InboxAuthRequired>
  </Route>,
  <Route exact path="/inbox/messages/:handle">
    <InboxAuthRequired>
      <ConversationPage />
    </InboxAuthRequired>
  </Route>,
];
