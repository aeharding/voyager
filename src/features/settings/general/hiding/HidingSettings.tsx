import { IonLabel, IonList } from "@ionic/react";
import DisableMarkingRead from "./DisableMarkingRead";
import MarkReadOnScroll from "./MarkReadOnScroll";
import { useAppSelector } from "../../../../store";
import ShowHideReadButton from "./ShowHideReadButton";
import { HelperText, ListHeader } from "../../shared/formatting";
import AutoHideRead from "./autoHide/AutoHideRead";
import DisableInCommunities from "./autoHide/DisableInCommunities";

export default function HidingSettings() {
  const disableMarkingRead = useAppSelector(
    (state) => state.settings.general.posts.disableMarkingRead,
  );

  return (
    <>
      <IonList inset>
        <DisableMarkingRead />
        {!disableMarkingRead && (
          <>
            <MarkReadOnScroll />
            <ShowHideReadButton />
          </>
        )}
      </IonList>

      {!disableMarkingRead && (
        <>
          <ListHeader>
            <IonLabel>Auto Hide</IonLabel>
          </ListHeader>
          <IonList inset>
            <AutoHideRead />
            <DisableInCommunities />
          </IonList>
          <HelperText>
            Auto Hide will automatically hide read posts when you refresh the
            feed. &quot;Disable in Communities&quot; stops posts from being
            automatically hidden when read inside inside a feed for a specific
            community.
          </HelperText>
        </>
      )}
    </>
  );
}
