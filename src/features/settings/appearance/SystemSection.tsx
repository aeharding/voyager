import styled from "@emotion/styled";
import { IonLabel, IonList } from "@ionic/react";
import DarkMode from "./DarkMode";
import ProfileLabel from "./ProfileLabel";
import { useAppSelector } from "../../../store";
import UserDarkMode from "./UserDarkMode";

const ListHeader = styled.div`
  font-size: 0.8em;
  margin: 32px 0 -8px 32px;
  text-transform: uppercase;
  color: var(--ion-color-medium);
`;

export default function SystemSection() {
  const { usingSystemDarkMode } = useAppSelector(
    (state) => state.appearance.dark
  );

  return (
    <>
      <ListHeader>
        <IonLabel>System</IonLabel>
      </ListHeader>
      <IonList inset>
        <ProfileLabel />
        <DarkMode />
      </IonList>

      {!usingSystemDarkMode && <UserDarkMode />}
    </>
  );
}
