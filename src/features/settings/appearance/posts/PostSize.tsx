import {
  ActionSheetButton,
  IonActionSheetCustomEvent,
  OverlayEventDetail,
} from "@ionic/core";
import {
  OPostAppearanceType,
  PostAppearanceType,
  setPostAppearance,
} from "../appearanceSlice";
import { startCase } from "lodash";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { InsetIonItem } from "../../../user/Profile";
import { IonActionSheet, IonLabel } from "@ionic/react";

const BUTTONS: ActionSheetButton<PostAppearanceType>[] = Object.values(
  OPostAppearanceType
).map(function (postAppearanceType) {
  return {
    text: startCase(postAppearanceType),
    data: postAppearanceType,
  } as ActionSheetButton<PostAppearanceType>;
});

export default function PostSize() {
  const [open, setOpen] = useState(false);

  const dispatch = useAppDispatch();
  const postsAppearanceType = useAppSelector(
    (state) => state.appearance.posts.type
  );

  return (
    <>
      <InsetIonItem button onClick={() => setOpen(true)}>
        <IonLabel>Post Size</IonLabel>
        <IonLabel slot="end" color="medium">
          {startCase(postsAppearanceType)}
        </IonLabel>
        <IonActionSheet
          cssClass="left-align-buttons"
          isOpen={open}
          onDidDismiss={() => setOpen(false)}
          onWillDismiss={(
            e: IonActionSheetCustomEvent<OverlayEventDetail<PostAppearanceType>>
          ) => {
            if (e.detail.data) {
              dispatch(setPostAppearance(e.detail.data));
            }
          }}
          header="Post Size"
          buttons={BUTTONS.map((b) => ({
            ...b,
            role: postsAppearanceType === b.data ? "selected" : undefined,
          }))}
        />
      </InsetIonItem>
    </>
  );
}
