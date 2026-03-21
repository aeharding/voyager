import { Route } from "react-router";

import ConversationPage from "#/routes/pages/inbox/ConversationPage";
import InboxAuthRequired from "#/routes/pages/inbox/InboxAuthRequired";

export default [
  <Route
    path="messages/:handle"
    element={
      <InboxAuthRequired>
        <ConversationPage />
      </InboxAuthRequired>
    }
  />,
];
