import { IonItem, IonToggle } from "@ionic/react";

import { useAppDispatch, useAppSelector } from "#/store";

import { setCompactTwoColumn } from "../../settingsSlice";

export default function CompactTwoColumn() {
  const dispatch = useAppDispatch();
  const compactTwoColumn = useAppSelector(
    (state) => state.settings.appearance.layout.compactTwoColumn,
  );

  return (
    <IonItem>
      <IonToggle
        checked={compactTwoColumn}
        onIonChange={(e) => dispatch(setCompactTwoColumn(e.detail.checked))}
      >
        Compact Posts with Two Columns
      </IonToggle>
    </IonItem>
  );
}
