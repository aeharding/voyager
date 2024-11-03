import {
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLoading,
  useIonAlert,
} from "@ionic/react";
import { styled } from "@linaria/react";
import { chevronForwardOutline } from "ionicons/icons";
import { PrivateMessageView } from "lemmy-js-client";
import { useState } from "react";

import { clientSelector } from "#/features/auth/authSelectors";
import ItemIcon from "#/features/labels/img/ItemIcon";
import { blockUser } from "#/features/user/userSlice";
import { getHandle } from "#/helpers/lemmy";
import { useAppDispatch, useAppSelector } from "#/store";

import Time from "./Time";

const StyledItemIcon = styled(ItemIcon)`
  margin: 0.75rem 0;
`;

const MessageContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0.5rem 0;

  width: 100%;
  min-width: 0;
`;

const MessageLine = styled.div`
  display: flex;
  gap: 0.3rem;
  min-width: 0;
  white-space: nowrap;
`;

const PersonLabel = styled.h3`
  flex: 1;

  font-size: 1rem;
  margin: 0;
  min-width: 0;

  display: inline;
  margin-right: auto;

  overflow: hidden;
  text-overflow: ellipsis;
`;

const OpenDetails = styled.span`
  flex: 0;

  font-size: 0.875em;

  display: inline-flex;
  align-items: center;
  gap: 0.25rem;

  color: var(--ion-color-medium);
`;

const MessagePreview = styled.div`
  --line-height: 1.3rem;
  --num-lines: 2;

  height: 2.5rem;
  line-height: var(--line-height);
  font-size: 0.875em;
  height: calc(var(--line-height) * var(--num-lines));

  color: var(--ion-color-medium);

  display: -webkit-box;
  -webkit-line-clamp: var(--num-lines);
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Dot = styled.div`
  position: absolute;
  top: 50%;
  left: 0.25rem;
  transform: translateY(-50%);

  background: var(--ion-color-primary);

  --size: 8px;

  border-radius: calc(var(--size) / 2);

  width: var(--size);
  height: var(--size);
`;

interface ConversationItemProps {
  messages: PrivateMessageView[];
}

export default function ConversationItem({ messages }: ConversationItemProps) {
  const dispatch = useAppDispatch();
  const [present] = useIonAlert();
  const [loading, setLoading] = useState(false);
  const myUserId = useAppSelector(
    (state) =>
      state.site.response?.my_user?.local_user_view?.local_user?.person_id,
  );
  const client = useAppSelector(clientSelector);

  const previewMsg = messages[0]!; // presorted, newest => oldest

  const person =
    previewMsg.creator.id === myUserId
      ? previewMsg.recipient
      : previewMsg.creator;

  const unread = !!messages.find(
    (msg) =>
      !msg.private_message.read && msg.private_message.creator_id !== myUserId,
  );

  async function onDelete() {
    const theirs = messages.filter((m) => m.creator.id !== myUserId);

    const theirPotentialRecentMessage = theirs.pop();

    if (!theirPotentialRecentMessage) {
      present(
        "This user hasn't messaged you, so there's nothing to block/report.",
      );
      return;
    }

    await present("Block and report conversation?", [
      {
        text: "Just block",
        role: "destructive",
        handler: () => {
          blockAndReportIfNeeded(theirPotentialRecentMessage);
        },
      },
      {
        text: "Block + Report",
        role: "destructive",
        handler: () => {
          blockAndReportIfNeeded(theirPotentialRecentMessage, true);
        },
      },
    ]);
  }

  async function blockAndReportIfNeeded(
    theirRecentMessage: PrivateMessageView,
    report = false,
  ) {
    setLoading(true);

    try {
      if (report) {
        await client.createPrivateMessageReport({
          private_message_id: theirRecentMessage.private_message.id,
          reason: "Spam or abuse",
        });
      }

      dispatch(blockUser(true, theirRecentMessage.creator.id));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <IonLoading isOpen={loading} />
      <IonItemSliding>
        <IonItemOptions side="end" onIonSwipe={onDelete}>
          <IonItemOption color="danger" expandable onClick={onDelete}>
            Block
          </IonItemOption>
        </IonItemOptions>

        <IonItem
          routerLink={`/inbox/messages/${getHandle(person)}`}
          href={undefined}
          draggable={false}
          detail={false}
        >
          <div slot="start">
            {unread ? <Dot /> : ""}
            <StyledItemIcon item={person} size={44} />
          </div>
          <MessageContent>
            <MessageLine>
              <PersonLabel>
                {person.display_name ?? getHandle(person)}
              </PersonLabel>
              <OpenDetails>
                <span>
                  <Time date={previewMsg.private_message.published} />
                </span>
                <IonIcon icon={chevronForwardOutline} />
              </OpenDetails>
            </MessageLine>
            <MessagePreview color="medium">
              {previewMsg.private_message.content}
            </MessagePreview>
          </MessageContent>
        </IonItem>
      </IonItemSliding>
    </>
  );
}
