import { IonList } from "@ionic/react";
import Enabled from "./Enabled";
import TrackVotes from "./TrackVotes";
import HideInstance from "./HideInstance";
import ResetTags from "./Reset";
import StoreSource from "./StoreSource";
import Browse from "./Browse";

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
