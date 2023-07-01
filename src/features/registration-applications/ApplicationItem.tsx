import { IonIcon, IonItem } from "@ionic/react";
import { getHandle } from "../../helpers/lemmy";
import { chevronForwardOutline } from "ionicons/icons";
import {
  Dot,
  MessageContent,
  MessageLine,
  MessagePreview,
  OpenDetails,
  PersonLabel,
  StyledItemIcon,
} from "../inbox/messages/ConversationItem";
import { RegistrationApplicationView } from "lemmy-js-client";
import Time from "../inbox/messages/Time";

interface ApplicationItemProps {
  application: RegistrationApplicationView;
}

export default function ApplicationItem({ application }: ApplicationItemProps) {
  const person = application.creator;
  const unread = !application.registration_application.admin_id;

  return (
    <IonItem
      routerLink={`/inbox/applications/application/${getHandle(person)}`}
      detail={false}
    >
      <div slot="start">
        {unread ? <Dot /> : ""}
        <StyledItemIcon item={person} size={44} />
      </div>
      <MessageContent>
        <MessageLine>
          <PersonLabel>{person.display_name ?? getHandle(person)}</PersonLabel>
          <OpenDetails>
            <span>
              <Time date={application.registration_application.published} />
            </span>
            <IonIcon icon={chevronForwardOutline} />
          </OpenDetails>
        </MessageLine>
        <MessagePreview color="medium">
          {application.registration_application.answer}
        </MessagePreview>
      </MessageContent>
    </IonItem>
  );
}
