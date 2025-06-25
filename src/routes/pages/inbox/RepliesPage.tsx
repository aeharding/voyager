import { IonBackButton, IonButtons, IonTitle, IonToolbar } from "@ionic/react";
import { CommentReplyView } from "threadiverse";

import { FetchFn } from "#/features/feed/Feed";
import InboxFeed from "#/features/feed/InboxFeed";
import { receivedInboxItems } from "#/features/inbox/inboxSlice";
import AppHeader from "#/features/shared/AppHeader";
import { AppPage } from "#/helpers/AppPage";
import useClient from "#/helpers/useClient";
import FeedContent from "#/routes/pages/shared/FeedContent";
import { useAppDispatch } from "#/store";

import MarkAllAsReadButton from "./MarkAllAsReadButton";

interface RepliesPageProps {
  type: "Comment" | "Post";
}

export default function RepliesPage({ type }: RepliesPageProps) {
  const dispatch = useAppDispatch();
  const client = useClient();

  const fetchFn: FetchFn<CommentReplyView> = async (pageData, ...rest) => {
    // TODO - actually paginate properly if Lemmy implements
    // reply pagination filtering by comment and post
    const response = await client.getReplies(
      {
        ...pageData,
        limit: 50,
        unread_only: false,
      },
      ...rest,
    );

    const replies = response.replies.filter((reply) =>
      type === "Post" ? isPostReply(reply) : !isPostReply(reply),
    );

    dispatch(receivedInboxItems(replies));

    return replies;
  };

  return (
    <AppPage>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/inbox" text="Boxes" />
          </IonButtons>

          <IonTitle>{type} Replies</IonTitle>

          <IonButtons slot="end">
            <MarkAllAsReadButton />
          </IonButtons>
        </IonToolbar>
      </AppHeader>
      <FeedContent>
        <InboxFeed fetchFn={fetchFn} />
      </FeedContent>
    </AppPage>
  );
}

export function isPostReply(reply: CommentReplyView): boolean {
  // path = 0.xxxxx is a reply to a post
  return reply.comment.path.split(".").length === 2;
}
