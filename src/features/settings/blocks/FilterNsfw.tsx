import styled from "@emotion/styled";
import { IonLabel, IonList, IonLoading, IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../store";
import { localUserSelector, showNsfw } from "../../auth/authSlice";
import { useState } from "react";

export const ListHeader = styled.div`
  font-size: 0.8em;
  margin: 32px 0 -8px 32px;
  text-transform: uppercase;
  color: var(--ion-color-medium);
`;

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
          <IonLabel>Hide all NSFW</IonLabel>
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
          />
        </InsetIonItem>
      </IonList>
      <IonLoading isOpen={loading} />
    </>
  );
}
