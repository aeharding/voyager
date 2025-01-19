import { IonLabel, IonList } from "@ionic/react";

import { HelperText, ListHeader } from "#/features/settings/shared/formatting";
import { useAppSelector } from "#/store";

import AutoHideRead from "./autoHide/AutoHideRead";
import DisableInCommunities from "./autoHide/DisableInCommunities";
import DisableMarkingRead from "./DisableMarkingRead";
import MarkReadOnScroll from "./MarkReadOnScroll";
import NeverShowReadPosts from "./NeverShowReadPosts";
import ShowHiddenInCommunities from "./ShowHiddenInCommunities";
import ShowHideReadButton from "./ShowHideReadButton";

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
            <ShowHiddenInCommunities />
            <NeverShowReadPosts />
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
            automatically hidden when read inside a feed for a specific
            community.
          </HelperText>
        </>
      )}
    </>
  );
}
