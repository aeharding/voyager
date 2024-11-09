import {
  IonItem,
  IonLabel,
  IonList,
  IonLoading,
  IonToggle,
} from "@ionic/react";
import { useState } from "react";

import { localUserSelector, showNsfw } from "#/features/auth/siteSlice";
import { ListHeader } from "#/features/settings/shared/formatting";
import { useAppDispatch, useAppSelector } from "#/store";

export default function FilterNsfw() {
  const dispatch = useAppDispatch();
  const localUser = useAppSelector(localUserSelector);
  const [loading, setLoading] = useState(false);

  return (
    <>
      <ListHeader>
        <IonLabel>NSFW</IonLabel>
      </ListHeader>
      <IonList inset>
        <IonItem>
          <IonToggle
            checked={!localUser?.show_nsfw}
            onIonChange={async () => {
              setLoading(true);
              try {
                await dispatch(showNsfw(!localUser?.show_nsfw));
              } finally {
                setLoading(false);
              }
            }}
          >
            Hide all NSFW
          </IonToggle>
        </IonItem>
      </IonList>
      <IonLoading isOpen={loading} />
    </>
  );
}
