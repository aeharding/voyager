/* eslint-disable react/jsx-key */
import { Route } from "react-router";

import ConversationPage from "#/routes/pages/inbox/ConversationPage";
import InboxAuthRequired from "#/routes/pages/inbox/InboxAuthRequired";

export default [
  <Route exact path="/inbox/messages/:handle">
    <InboxAuthRequired>
      <ConversationPage />
    </InboxAuthRequired>
  </Route>,
];
