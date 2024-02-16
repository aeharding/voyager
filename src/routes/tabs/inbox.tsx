/* eslint-disable react/jsx-key */

import Route from "../common/Route";
import BoxesPage from "../pages/inbox/BoxesPage";
import ConversationPage from "../pages/inbox/ConversationPage";
import InboxAuthRequired from "../pages/inbox/InboxAuthRequired";
import InboxPage from "../pages/inbox/InboxPage";
import MentionsPage from "../pages/inbox/MentionsPage";
import MessagesPage from "../pages/inbox/MessagesPage";
import RepliesPage from "../pages/inbox/RepliesPage";
import { buildGeneralBrowseRoutes } from "./general";

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
  ...buildGeneralBrowseRoutes("inbox"),
];
