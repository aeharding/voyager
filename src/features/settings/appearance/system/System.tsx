import { IonLabel } from "@ionic/react";
import DarkMode from "./DarkMode";
import { ListHeader } from "../TextSize";

export default function System() {
  return (
    <>
      <ListHeader>
        <IonLabel>System</IonLabel>
      </ListHeader>
      <DarkMode />
    </>
  );
}
