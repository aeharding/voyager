import type { IonActionSheetCustomEvent } from "@ionic/core";
import {
  ActionSheetButton,
  IonActionSheet,
  IonLabel,
  IonList,
  IonToggle,
} from "@ionic/react";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { startCase } from "lodash";
import { useState } from "react";
import { OPostBlurNsfw, PostAppearanceType } from "../../../services/db";
import { useAppDispatch, useAppSelector } from "../../../store";
import { InsetIonItem } from "../../user/Profile";
import { ListHeader } from "./TextSize";
import {
  OPostAppearanceType,
  setBlurNsfwState,
  setPostAppearance,
} from "./appearanceSlice";

const BUTTONS: ActionSheetButton<PostAppearanceType>[] = Object.values(
  OPostAppearanceType
).map(function (postAppearanceType) {
  return {
    text: startCase(postAppearanceType),
    data: postAppearanceType,
  } as ActionSheetButton<PostAppearanceType>;
});

export default function PostView() {
  const [open, setOpen] = useState(false);

  const dispatch = useAppDispatch();
  const postsAppearanceType = useAppSelector(
    (state) => state.appearance.posts.type
  );
  const nsfwBlurred = useAppSelector(
    (state) => state.appearance.posts.blur_nsfw
  );

  return (
    <>
      <ListHeader>
        <IonLabel>Posts</IonLabel>
      </ListHeader>
      <IonList inset>
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
              e: IonActionSheetCustomEvent<
                OverlayEventDetail<PostAppearanceType>
              >
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
        <InsetIonItem>
          <IonLabel>Blur NSFW Images in Feed</IonLabel>
          <IonToggle
            checked={nsfwBlurred === OPostBlurNsfw.Always}
            onIonChange={(e) => {
              dispatch(
                setBlurNsfwState(
                  e.detail.checked ? OPostBlurNsfw.Always : OPostBlurNsfw.Never
                )
              );
            }}
          />
        </InsetIonItem>
      </IonList>
    </>
  );
}
