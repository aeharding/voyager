import { IonAlert } from "@ionic/react";
import { Dispatch, SetStateAction } from "react";
import { formatDistanceToNowStrict } from "date-fns";

interface AccountAgeAlertProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  accountCreated: string;
}

export default function AccountAgeAlert(props: AccountAgeAlertProps) {
  const relativeDate = formatDistanceToNowStrict(
    new Date(`${props.accountCreated}Z`),
    {
      addSuffix: false,
    },
  );

  const creationDate = new Date(props.accountCreated);

  return (
    <IonAlert
      isOpen={props.isOpen}
      header={`Account is ${relativeDate} old`}
      buttons={[{ text: "OK", handler: () => props.setIsOpen(false) }]}
      onDidDismiss={() => props.setIsOpen(false)}
      message={`Created on ${creationDate.toDateString()} at ${creationDate.toLocaleTimeString()}`}
    />
  );
}
