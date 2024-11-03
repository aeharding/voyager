import { IonList } from "@ionic/react";

import Browse from "./Browse";
import Enabled from "./Enabled";
import HideInstance from "./HideInstance";
import ResetTags from "./Reset";
import StoreSource from "./StoreSource";
import TrackVotes from "./TrackVotes";

export default function TagsSettings() {
  return (
    <>
      <IonList inset>
        <Enabled />
      </IonList>
      <IonList inset>
        <Browse />
      </IonList>
      <IonList inset>
        <TrackVotes />
        <HideInstance />
        <StoreSource />
        <ResetTags />
      </IonList>
    </>
  );
}
