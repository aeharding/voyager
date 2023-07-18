import { IonLabel, IonList } from "@ionic/react";
import DarkMode from "./DarkMode";
import { ListHeader } from "../TextSize";
import DeviceMode from "./DeviceMode";
import { useAppSelector } from "../../../../store";
import UserDarkMode from "./UserDarkMode";

export default function System() {
  const { usingSystemDarkMode } = useAppSelector(
    (state) => state.settings.appearance.dark
  );

  return (
    <>
      <ListHeader>
        <IonLabel>System</IonLabel>
      </ListHeader>
      <IonList inset>
        <DeviceMode />
        <DarkMode />
      </IonList>

      {!usingSystemDarkMode && <UserDarkMode />}
    </>
  );
}
