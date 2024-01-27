import styled from "@emotion/styled";
import {
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLoading,
  useIonAlert,
} from "@ionic/react";
import { PrivateMessageView } from "lemmy-js-client";
import { useAppDispatch, useAppSelector } from "../../../store";
import { getHandle } from "../../../helpers/lemmy";
import ItemIcon from "../../labels/img/ItemIcon";
import { chevronForwardOutline, removeCircle } from "ionicons/icons";
import Time from "./Time";
import { css } from "@emotion/react";
import { resetMessages, syncMessages } from "../inboxSlice";
import { useState } from "react";
import { clientSelector } from "../../auth/authSelectors";

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

const SquareIonItemOption = styled(IonItemOption)`
  width: 85px;
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

  const unread = !!messages.find((msg) => !msg.private_message.read);

  async function onDelete() {
    const mine = messages.filter((m) => m.creator.id === myUserId);
    const theirs = messages.filter((m) => m.creator.id !== myUserId);

    const theirPotentialRecentMessage = theirs.pop();

    if (!theirPotentialRecentMessage) return;

    if (mine.length <= 1) {
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

      await client.blockPerson({
        person_id: theirRecentMessage.creator.id,
        block: true,
      });

      dispatch(resetMessages());
      await dispatch(syncMessages());
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <IonLoading isOpen={loading} />
      <IonItemSliding>
        <IonItemOptions side="end" onIonSwipe={onDelete}>
          <SquareIonItemOption color="danger" expandable onClick={onDelete}>
            <IonIcon
              icon={removeCircle}
              css={css`
                font-size: 1.4em;
              `}
            />
          </SquareIonItemOption>
        </IonItemOptions>

        <IonItem
          routerLink={`/inbox/messages/${getHandle(person)}`}
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
