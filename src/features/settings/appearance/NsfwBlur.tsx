import styled from "@emotion/styled";
import { IonLabel, IonList, IonToggle } from "@ionic/react";
import { InsetIonItem } from "../../../pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../store";
import { setPostBlur } from "./appearanceSlice";

const ListHeader = styled.div`
  font-size: 0.8em;
  margin: 32px 0 -8px 32px;
  text-transform: uppercase;
  color: var(--ion-color-medium);
`;

export default function NsfwBlur() {

    const dispatch = useAppDispatch();
    const blur = useAppSelector(
      (state) => state.appearance.posts.blur
    );

  return (
    <>
        <IonList inset>
            <InsetIonItem>
            <IonLabel>Blur NSFW Images</IonLabel>
            <IonToggle 
                checked={blur}
                onIonChange={(e) =>
                dispatch(setPostBlur(e.detail.checked))
                }
            />
            </InsetIonItem>
        </IonList>
    </>
  );
}
