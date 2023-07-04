import { IonActionSheet, IonLabel, IonList } from "@ionic/react";
import { InsetIonItem } from "../../../pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../store";
import { startCase } from "lodash";
import { useState } from "react";
import {
  ActionSheetButton,
  IonActionSheetCustomEvent,
  OverlayEventDetail,
} from "@ionic/core";
import { OVoteDisplayMode, VoteDisplayMode } from "../../../services/db";
import { ListHeader } from "./TextSize";
import { setVoteDisplayMode } from "../settingsSlice";

const BUTTONS: ActionSheetButton<VoteDisplayMode>[] = Object.values(
  OVoteDisplayMode
).map(function (voteDisplayMode) {
  return {
    text: startCase(voteDisplayMode),
    data: voteDisplayMode,
  } as ActionSheetButton<VoteDisplayMode>;
});

export default function CollapsedByDefault() {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const voteDisplayMode = useAppSelector(
    (state) => state.settings.appearance.voting.voteDisplayMode
  );

  return (
    <>
      <ListHeader>
        <IonLabel>Voting</IonLabel>
      </ListHeader>
      <IonList inset>
        <InsetIonItem button onClick={() => setOpen(true)}>
          <IonLabel>Vote Display Mode</IonLabel>
          <IonLabel slot="end" color="medium">
            {startCase(voteDisplayMode)}
          </IonLabel>
          <IonActionSheet
            cssClass="left-align-buttons"
            isOpen={open}
            onDidDismiss={() => setOpen(false)}
            onWillDismiss={(
              e: IonActionSheetCustomEvent<OverlayEventDetail<VoteDisplayMode>>
            ) => {
              if (e.detail.data) {
                dispatch(setVoteDisplayMode(e.detail.data));
              }
            }}
            header="Post Size"
            buttons={BUTTONS.map((b) => ({
              ...b,
              role: voteDisplayMode === b.data ? "selected" : undefined,
            }))}
          />
        </InsetIonItem>
      </IonList>
    </>
  );
}
