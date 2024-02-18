import { IonLabel, IonList, IonLoading, IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../routes/pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../store";
import { localUserSelector, showNsfw } from "../../auth/siteSlice";
import { useState } from "react";
import { ListHeader } from "../shared/formatting";

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
        <InsetIonItem>
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
        </InsetIonItem>
      </IonList>
      <IonLoading isOpen={loading} />
    </>
  );
}
