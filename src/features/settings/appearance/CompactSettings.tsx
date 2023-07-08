import type { IonActionSheetCustomEvent } from "@ionic/core";
import {
  ActionSheetButton,
  IonLabel,
  IonList,
  IonActionSheet,
  IonToggle,
} from "@ionic/react";
import { InsetIonItem } from "../../user/Profile";
import { useAppSelector, useAppDispatch } from "../../../store";
import { useState } from "react";
import { startCase } from "lodash";
import { setShowVotingButtons, setThumbnailPosition } from "../settingsSlice";
import {
  OCompactThumbnailPositionType,
  CompactThumbnailPositionType,
} from "../../../services/db";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { ListHeader } from "../shared/formatting";

const BUTTONS: ActionSheetButton<CompactThumbnailPositionType>[] =
  Object.values(OCompactThumbnailPositionType).map(function (
    compactThumbnailPositionType
  ) {
    return {
      text: startCase(compactThumbnailPositionType),
      data: compactThumbnailPositionType,
    } as ActionSheetButton<CompactThumbnailPositionType>;
  });

export default function CompactSettings() {
  const [open, setOpen] = useState(false);

  const dispatch = useAppDispatch();
  const compactThumbnailsPositionType = useAppSelector(
    (state) => state.settings.appearance.compact.thumbnailsPosition
  );

  const compactShowVotingButtons = useAppSelector(
    (state) => state.settings.appearance.compact.showVotingButtons
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
            {startCase(compactThumbnailsPositionType)}
          </IonLabel>
          <IonActionSheet
            cssClass="left-align-buttons"
            isOpen={open}
            onDidDismiss={() => setOpen(false)}
            onWillDismiss={(
              e: IonActionSheetCustomEvent<
                OverlayEventDetail<CompactThumbnailPositionType>
              >
            ) => {
              if (e.detail.data) {
                dispatch(setThumbnailPosition(e.detail.data));
              }
            }}
            header="Position"
            buttons={BUTTONS.map((b) => ({
              ...b,
              role:
                compactThumbnailsPositionType === b.data
                  ? "selected"
                  : undefined,
            }))}
          />
        </InsetIonItem>
        <InsetIonItem>
          <IonLabel>Show Voting Buttons</IonLabel>
          <IonToggle
            checked={compactShowVotingButtons === true}
            onIonChange={(e) =>
              dispatch(setShowVotingButtons(e.detail.checked ? true : false))
            }
          />
        </InsetIonItem>
      </IonList>
    </>
  );
}
