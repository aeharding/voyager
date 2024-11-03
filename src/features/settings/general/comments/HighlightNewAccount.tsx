import { IonItem, IonToggle } from "@ionic/react";

import { useAppDispatch, useAppSelector } from "#/store";

import { setHighlightNewAccount } from "../../settingsSlice";

export default function HighlightNewAccount() {
  const dispatch = useAppDispatch();
  const { highlightNewAccount } = useAppSelector(
    // this needs a better naming
    (state) => state.settings.general.comments,
  );

  return (
    <IonItem>
      <IonToggle
        checked={highlightNewAccount}
        onIonChange={(e) => dispatch(setHighlightNewAccount(e.detail.checked))}
      >
        New Account Highlightenator
      </IonToggle>
    </IonItem>
  );
}
