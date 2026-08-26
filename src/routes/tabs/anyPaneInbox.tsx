import route from "#/routes/common/Route";
import ConversationPage from "#/routes/pages/inbox/ConversationPage";
import InboxAuthRequired from "#/routes/pages/inbox/InboxAuthRequired";

export default [
  route(
    "/inbox/messages/:handle",
    <InboxAuthRequired>
      <ConversationPage />
    </InboxAuthRequired>,
  ),
];
