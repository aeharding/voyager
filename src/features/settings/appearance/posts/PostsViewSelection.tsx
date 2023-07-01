import { IonList, IonRadio, IonRadioGroup } from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { InsetIonItem } from "../../../user/Profile";
import { OPostAppearanceType, setPostAppearance } from "../appearanceSlice";

export default function PostsViewSelection() {
  const dispatch = useAppDispatch();
  const postAppearanceType = useAppSelector(
    (state) => state.appearance.posts.type
  );

  return (
    <IonRadioGroup
      value={postAppearanceType}
      onIonChange={(e) => {
        dispatch(setPostAppearance(e.target.value));
      }}
    >
      <IonList inset>
        <InsetIonItem>
          <IonRadio value={OPostAppearanceType.Large}>Large</IonRadio>
        </InsetIonItem>
        <InsetIonItem>
          <IonRadio value={OPostAppearanceType.Compact}>Compact</IonRadio>
        </InsetIonItem>
      </IonList>
    </IonRadioGroup>
  );
}
