import styled from "@emotion/styled";
import { IonLabel, IonList } from "@ionic/react";
import DarkMode from "./DarkMode";
import ProfileLabel from "./ProfileLabel";

const ListHeader = styled.div`
  font-size: 0.8em;
  margin: 32px 0 -8px 32px;
  text-transform: uppercase;
  color: var(--ion-color-medium);
`;

export default function SystemSection() {
  return (
    <>
      <ListHeader>
        <IonLabel>System</IonLabel>
      </ListHeader>
      <IonList inset>
        <DarkMode />
        <ProfileLabel />
      </IonList>
    </>
  );
}
