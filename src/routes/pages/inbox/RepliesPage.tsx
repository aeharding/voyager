import {
  IonBackButton,
  IonButtons,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { CommentReplyView } from "lemmy-js-client";
import { useRef } from "react";

import { useSetActivePage } from "#/features/auth/AppContext";
import { FetchFn } from "#/features/feed/Feed";
import InboxFeed from "#/features/feed/InboxFeed";
import { receivedInboxItems } from "#/features/inbox/inboxSlice";
import AppHeader from "#/features/shared/AppHeader";
import useClient from "#/helpers/useClient";
import FeedContent from "#/routes/pages/shared/FeedContent";
import { useAppDispatch } from "#/store";

import MarkAllAsReadButton from "./MarkAllAsReadButton";

interface RepliesPageProps {
  type: "Comment" | "Post";
}

export default function RepliesPage({ type }: RepliesPageProps) {
  const pageRef = useRef<HTMLElement>(null);
  const dispatch = useAppDispatch();
  const client = useClient();

  useSetActivePage(pageRef);

  const fetchFn: FetchFn<CommentReplyView> = async (pageData, ...rest) => {
    // TODO - actually paginate properly if Lemmy implements
    // reply pagination filtering by comment and post
    const response = await client.getReplies(
      {
        ...pageData,
        limit: 50,
        sort: "New",
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
    <IonPage ref={pageRef}>
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
    </IonPage>
  );
}

export function isPostReply(reply: CommentReplyView): boolean {
  // path = 0.xxxxx is a reply to a post
  return reply.comment.path.split(".").length === 2;
}
