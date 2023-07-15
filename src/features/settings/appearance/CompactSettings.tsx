import type { IonActionSheetCustomEvent } from "@ionic/core";
import {
  ActionSheetButton,
  IonLabel,
  IonList,
  IonActionSheet,
  IonToggle,
} from "@ionic/react";
import { ListHeader } from "./TextSize";
import { InsetIonItem } from "../../user/Profile";
import { useAppSelector, useAppDispatch } from "../../../store";
import { useState } from "react";
import { startCase } from "lodash";
import { setShowVotingButtons, setThumbnailPosition } from "./appearanceSlice";
import {
  OShowVotingButtons,
  OThumbnailPositionType,
  ThumbnailPositionType,
} from "../../../services/db";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";

const BUTTONS: ActionSheetButton<ThumbnailPositionType>[] = Object.values(
  OThumbnailPositionType
).map(function (thumbnailPositionType) {
  return {
    text: startCase(thumbnailPositionType),
    data: thumbnailPositionType,
  } as ActionSheetButton<ThumbnailPositionType>;
});

export default function CompactSettings() {
  const [open, setOpen] = useState(false);

  const dispatch = useAppDispatch();
  const thumbnailsPositionType = useAppSelector(
    (state) => state.appearance.thumbnails.position
  );

  const showVotingButtons = useAppSelector(
    (state) => state.appearance.votingButtons.show
  );

  return (
    <>
      <ListHeader>
        <IonLabel>Compact Posts</IonLabel>
      </ListHeader>
      <IonList inset>
        <InsetIonItem button onClick={() => setOpen(true)}>
          <IonLabel>Thumbnail Position</IonLabel>
          <IonLabel slot="end" color="medium">
            {startCase(thumbnailsPositionType)}
          </IonLabel>
          <IonActionSheet
            cssClass="left-align-buttons"
            isOpen={open}
            onDidDismiss={() => setOpen(false)}
            onWillDismiss={(
              e: IonActionSheetCustomEvent<
                OverlayEventDetail<ThumbnailPositionType>
              >
            ) => {
              if (e.detail.data) {
                dispatch(setThumbnailPosition(e.detail.data));
              }
            }}
            header="Position"
            buttons={BUTTONS.map((b) => ({
              ...b,
              role: thumbnailsPositionType === b.data ? "selected" : undefined,
            }))}
          />
        </InsetIonItem>
        <InsetIonItem>
          <IonLabel>Show Voting Buttons</IonLabel>
          <IonToggle
            checked={showVotingButtons === OShowVotingButtons.Always}
            onIonChange={(e) =>
              dispatch(
                setShowVotingButtons(
                  e.detail.checked
                    ? OShowVotingButtons.Always
                    : OShowVotingButtons.Never
                )
              )
            }
          />
        </InsetIonItem>
      </IonList>
    </>
  );
}
