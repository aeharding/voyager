import { IonLabel } from "@ionic/react";
import { IonList } from "@ionic/react";

import { ListHeader } from "#/features/settings/shared/formatting";

import HideAltText from "./HideAltText";
import ShowControlsOnOpen from "./ShowControlsOnOpen";

export default function Media() {
  return (
    <>
      <ListHeader>
        <IonLabel>Media</IonLabel>
      </ListHeader>
      <IonList inset>
        <ShowControlsOnOpen />
        <HideAltText />
      </IonList>
    </>
  );
}
