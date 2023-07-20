import { ActionSheetButton, IonActionSheet, IonLabel } from "@ionic/react";
import { startCase } from "lodash";
import { InsetIonItem } from "../../../user/Profile";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { useState } from "react";
import {
  CommentDefaultSort,
  OCommentDefaultSort,
} from "../../../../services/db";
import { IonActionSheetCustomEvent, OverlayEventDetail } from "@ionic/core";
import { setDefaultCommentSort } from "../../settingsSlice";
import { getSortIcon } from "../../../comment/CommentSort";

const BUTTONS: ActionSheetButton<CommentDefaultSort>[] = Object.values(
  OCommentDefaultSort
).map(function (commentSort) {
  return {
    text: startCase(commentSort),
    data: commentSort,
    icon: getSortIcon(commentSort),
  } as ActionSheetButton<CommentDefaultSort>;
});

export default function DefaultSort() {
  const [open, setOpen] = useState(false);

  const dispatch = useAppDispatch();
  const postsAppearanceType = useAppSelector(
    (state) => state.settings.general.comments.sort
  );

  return (
    <>
      <InsetIonItem button onClick={() => setOpen(true)}>
        <IonLabel>Default Sort</IonLabel>
        <IonLabel slot="end" color="medium">
          {startCase(postsAppearanceType)}
        </IonLabel>
        <IonActionSheet
          cssClass="left-align-buttons"
          isOpen={open}
          onDidDismiss={() => setOpen(false)}
          onWillDismiss={(
            e: IonActionSheetCustomEvent<OverlayEventDetail<CommentDefaultSort>>
          ) => {
            if (e.detail.data) {
              dispatch(setDefaultCommentSort(e.detail.data));
            }
          }}
          header="Default Comments Sort..."
          buttons={BUTTONS.map((b) => ({
            ...b,
            role: postsAppearanceType === b.data ? "selected" : undefined,
          }))}
        />
      </InsetIonItem>
    </>
  );
}
