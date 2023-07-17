import { type FC, MouseEvent, useContext, useState } from "react";
import {
  IonBadge,
  IonHeader,
  IonIcon,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from "@ionic/react";

import {
  albumsOutline,
  chatbubbleOutline,
  ellipseOutline,
  fileTray,
  mail,
  personCircleOutline,
} from "ionicons/icons";

import { isPostReply } from "./RepliesPage";
import { jwtSelector } from "../../features/auth/authSlice";
import { PageContext } from "../../features/auth/PageContext";
import AppContent from "../../features/shared/AppContent";
import { InsetIonItem, SettingLabel } from "../../features/user/Profile";
import { getInboxCounts } from "../../features/inbox/inboxSlice";
import useClient from "../../helpers/useClient";
import { useAppDispatch, useAppSelector } from "../../store";

const UnreadBubble: FC<{ count: number }> = ({ count }) =>
  count ? (
    <IonBadge color="danger" slot="end">
      {count}
    </IonBadge>
  ) : null;

export default function BoxesPage() {
  const client = useClient();
  const jwt = useAppSelector(jwtSelector);
  const dispatch = useAppDispatch();
  const {
    mentions: unreadMentions,
    messages: unreadMessages,
    replies: unreadReplies,
  } = useAppSelector((state) => state.inbox.counts);
  const [unreadPostReplies, setUnreadPostReplies] = useState(0);
  const [unreadCountsResolved, setUnreadCountsResolved] = useState(false);

  const getUnreadPostReplyCount = async (): Promise<void> => {
    if (!jwt) return;

    const allUnreads = await client.getReplies({
      limit: 50,
      page: 1,
      auth: jwt,
      unread_only: true,
    });

    const unreadPostReplies =
      allUnreads?.replies.reduce(
        (acc, item) =>
          "comment_reply" in item && isPostReply(item) ? acc + 1 : acc,
        0
      ) ?? 0;

    setUnreadPostReplies(unreadPostReplies);
    setUnreadCountsResolved(true);
  };

  const { presentLoginIfNeeded } = useContext(PageContext);

  useIonViewWillEnter(() => {
    dispatch(getInboxCounts());
    getUnreadPostReplyCount();
  });

  function interceptIfLoggedOut(e: MouseEvent) {
    if (presentLoginIfNeeded()) e.preventDefault();
  }

  return (
    <IonPage className="grey-bg">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Boxes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <AppContent scrollY>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Boxes</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonList inset color="primary">
          <InsetIonItem routerLink="/inbox/all" onClick={interceptIfLoggedOut}>
            <IonIcon icon={fileTray} color="primary" />
            <SettingLabel>Inbox (All)</SettingLabel>
          </InsetIonItem>
          <InsetIonItem
            routerLink="/inbox/unread"
            onClick={interceptIfLoggedOut}
          >
            <IonIcon icon={ellipseOutline} color="primary" />
            <SettingLabel>Unread</SettingLabel>
          </InsetIonItem>
        </IonList>

        <IonList inset color="primary">
          <InsetIonItem
            routerLink="/inbox/post-replies"
            onClick={interceptIfLoggedOut}
          >
            <IonIcon icon={albumsOutline} color="primary" />
            <SettingLabel>Post Replies</SettingLabel>
            {unreadCountsResolved && <UnreadBubble count={unreadPostReplies} />}
          </InsetIonItem>
          <InsetIonItem
            routerLink="/inbox/comment-replies"
            onClick={interceptIfLoggedOut}
          >
            <IonIcon icon={chatbubbleOutline} color="primary" />
            <SettingLabel>Comment Replies</SettingLabel>
            {unreadCountsResolved && (
              <UnreadBubble count={unreadReplies - unreadPostReplies} />
            )}
          </InsetIonItem>
          <InsetIonItem
            routerLink="/inbox/mentions"
            onClick={interceptIfLoggedOut}
          >
            <IonIcon icon={personCircleOutline} color="primary" />
            <SettingLabel>Mentions</SettingLabel>
            {unreadCountsResolved && <UnreadBubble count={unreadMentions} />}
          </InsetIonItem>
        </IonList>

        <IonList inset color="primary">
          <InsetIonItem
            routerLink="/inbox/messages"
            onClick={interceptIfLoggedOut}
          >
            <IonIcon icon={mail} color="primary" />
            <SettingLabel>Messages</SettingLabel>
            {unreadCountsResolved && <UnreadBubble count={unreadMessages} />}
          </InsetIonItem>
        </IonList>
      </AppContent>
    </IonPage>
  );
}
