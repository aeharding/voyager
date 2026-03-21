import type { ReactElement } from "react";
import { Route } from "react-router-dom";

import ConversationPage from "#/routes/pages/inbox/ConversationPage";
import InboxAuthRequired from "#/routes/pages/inbox/InboxAuthRequired";
import PostDetail from "#/routes/pages/posts/PostPage";

/**
 * `Route` elements for [`SecondColumnContent`](src/routes/twoColumn/SecondColumnContent.tsx)
 * with `location` already stripped of `/${tab}` (see `locationWithinTab`).
 */
export function secondColumnPaneRouteElements(tab: string): ReactElement[] {
  const routes: ReactElement[] = [];

  if (tab === "inbox") {
    routes.push(
      <Route
        key="sc-inbox-messages"
        path="messages/:handle"
        element={
          <InboxAuthRequired>
            <ConversationPage />
          </InboxAuthRequired>
        }
      />,
    );
  }

  routes.push(
    <Route
      key="sc-comments-id"
      path=":actor/c/:community/comments/:id"
      element={<PostDetail />}
    />,
    <Route
      key="sc-comments-thread"
      path=":actor/c/:community/comments/:id/thread/:threadCommentId"
      element={<PostDetail />}
    />,
    <Route
      key="sc-comments-path"
      path=":actor/c/:community/comments/:id/:commentPath"
      element={<PostDetail />}
    />,
  );

  return routes;
}
