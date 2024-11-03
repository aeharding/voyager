import { IonLabel, IonList } from "@ionic/react";

import { ListHeader } from "#/features/settings/shared/formatting";

import PureBlack from "./PureBlack";

export default function Dark() {
  return (
    <>
      <ListHeader>
        <IonLabel>Dark Mode</IonLabel>
      </ListHeader>

      <IonList inset>
        <PureBlack />
      </IonList>
    </>
  );
}
