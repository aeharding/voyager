import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useAppDispatch } from "../../store";
import useClient from "../../helpers/useClient";
import { FetchFn } from "../../features/feed/Feed";
import { useCallback } from "react";
import { CommentReplyView } from "lemmy-js-client";
import InboxFeed from "../../features/feed/InboxFeed";
import { receivedInboxItems } from "../../features/inbox/inboxSlice";
import MarkAllAsReadButton from "./MarkAllAsReadButton";
import FeedContent from "../shared/FeedContent";

interface RepliesPageProps {
  type: "Comment" | "Post";
}

export default function RepliesPage({ type }: RepliesPageProps) {
  const dispatch = useAppDispatch();
  const client = useClient();

  const fetchFn: FetchFn<CommentReplyView> = useCallback(
    async (page) => {
      // TODO - actually paginate properly if Lemmy implements
      // reply pagination filtering by comment and post
      const response = await client.getReplies({
        limit: 50,
        page,
        sort: "New",
        unread_only: false,
      });

      const replies = response.replies.filter((reply) =>
        type === "Post" ? isPostReply(reply) : !isPostReply(reply),
      );

      dispatch(receivedInboxItems(replies));

      return replies;
    },
    [client, dispatch, type],
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/inbox" text="Boxes" />
          </IonButtons>

          <IonTitle>{type} Replies</IonTitle>

          <IonButtons slot="end">
            <MarkAllAsReadButton />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
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
