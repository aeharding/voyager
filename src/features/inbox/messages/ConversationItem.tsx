import styled from "@emotion/styled";
import { IonIcon, IonItem } from "@ionic/react";
import { PrivateMessageView } from "lemmy-js-client";
import { useAppSelector } from "../../../store";
import { getHandle } from "../../../helpers/lemmy";
import ItemIcon from "../../labels/img/ItemIcon";
import { chevronForwardOutline } from "ionicons/icons";
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
  const myUserId = useAppSelector(
    (state) => state.auth.site?.my_user?.local_user_view?.local_user?.person_id
  );

  const previewMsg = messages[0]; // presorted, newest => oldest

  const person =
    previewMsg.creator.id === myUserId
      ? previewMsg.recipient
      : previewMsg.creator;

  const unread = !!messages.find((msg) => !msg.private_message.read);

  return (
    <IonItem routerLink={`/inbox/messages/${getHandle(person)}`} detail={false}>
      <div slot="start">
        {unread ? <Dot /> : ""}
        <StyledItemIcon item={person} size={44} />
      </div>
      <MessageContent>
        <MessageLine>
          <PersonLabel>{person.display_name ?? getHandle(person)}</PersonLabel>
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
  );
}
