import { IonRouterOutlet } from "@ionic/react";
import { Route } from "react-router";

import { TabNameContext } from "#/routes/common/Route";
import BoxesPage from "#/routes/pages/inbox/BoxesPage";
import InboxAuthRequired from "#/routes/pages/inbox/InboxAuthRequired";
import InboxPage from "#/routes/pages/inbox/InboxPage";
import MentionsPage from "#/routes/pages/inbox/MentionsPage";
import MessagesPage from "#/routes/pages/inbox/MessagesPage";
import RepliesPage from "#/routes/pages/inbox/RepliesPage";

import anyPaneInbox from "./anyPaneInbox";
import { instanceBrowseRouteElements } from "./shared/instanceBrowseRoutes";

export default function Inbox() {
  return (
    <TabNameContext value="inbox">
      <IonRouterOutlet>
        <Route index element={<BoxesPage />} />
        {...instanceBrowseRouteElements({ postsActorIndex: false })}
        <Route
          path="all"
          element={
            <InboxAuthRequired>
              <InboxPage showRead />
            </InboxAuthRequired>
          }
        />
        <Route
          path="unread"
          element={
            <InboxAuthRequired>
              <InboxPage />
            </InboxAuthRequired>
          }
        />
        <Route
          path="mentions"
          element={
            <InboxAuthRequired>
              <MentionsPage />
            </InboxAuthRequired>
          }
        />
        <Route
          path="comment-replies"
          element={
            <InboxAuthRequired>
              <RepliesPage type="Comment" />
            </InboxAuthRequired>
          }
        />
        <Route
          path="post-replies"
          element={
            <InboxAuthRequired>
              <RepliesPage type="Post" />
            </InboxAuthRequired>
          }
        />
        <Route
          path="messages"
          element={
            <InboxAuthRequired>
              <MessagesPage />
            </InboxAuthRequired>
          }
        />
        {...anyPaneInbox}
      </IonRouterOutlet>
    </TabNameContext>
  );
}
