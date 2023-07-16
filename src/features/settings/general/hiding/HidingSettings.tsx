import { IonList } from "@ionic/react";
import DisableMarkingRead from "./DisableMarkingRead";

export default function HidingSettings() {
  return (
    <>
      <IonList inset>
        <DisableMarkingRead />
      </IonList>
    </>
  );
}
