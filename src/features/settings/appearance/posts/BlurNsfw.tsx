import { IonActionSheet, IonLabel } from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { InsetIonItem } from "../../../user/Profile";
import { startCase } from "lodash";
import { useState } from "react";
import {
  ActionSheetButton,
  IonActionSheetCustomEvent,
  OverlayEventDetail,
} from "@ionic/core";
import { OPostBlurNsfw, PostBlurNsfwType } from "../../../../services/db";
import { setBlurNsfwState } from "../appearanceSlice";

const BUTTONS: ActionSheetButton<PostBlurNsfwType>[] = Object.values(
  OPostBlurNsfw
).map(function (postBlurNsfw) {
  return {
    text: startCase(postBlurNsfw),
    data: postBlurNsfw,
  } as ActionSheetButton<PostBlurNsfwType>;
});

export default function BlurNsfw() {
  const [open, setOpen] = useState(false);

  const dispatch = useAppDispatch();
  const nsfwBlurred = useAppSelector(
    (state) => state.appearance.posts.blurNsfw
  );

  return (
    <>
      <InsetIonItem button onClick={() => setOpen(true)}>
        <IonLabel>Blur NSFW</IonLabel>
        <IonLabel slot="end" color="medium">
          {startCase(nsfwBlurred)}
        </IonLabel>
        <IonActionSheet
          cssClass="left-align-buttons"
          isOpen={open}
          onDidDismiss={() => setOpen(false)}
          onWillDismiss={(
            e: IonActionSheetCustomEvent<OverlayEventDetail<PostBlurNsfwType>>
          ) => {
            if (e.detail.data) {
              dispatch(setBlurNsfwState(e.detail.data));
            }
          }}
          header="Blur NSFW"
          buttons={BUTTONS.map((b) => ({
            ...b,
            role: nsfwBlurred === b.data ? "selected" : undefined,
          }))}
        />
      </InsetIonItem>
    </>
  );
}
