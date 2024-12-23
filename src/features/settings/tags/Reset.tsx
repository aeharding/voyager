import { IonItem, IonLabel, useIonAlert } from "@ionic/react";

import { resetTags } from "#/features/tags/userTagSlice";
import useAppToast from "#/helpers/useAppToast";

import { useAppDispatch } from "../../../store";

export default function ResetTags() {
  const [presentAlert] = useIonAlert();
  const presentToast = useAppToast();
  const dispatch = useAppDispatch();

  function reset() {
    presentAlert({
      header: "Reset Tags",
      message: "Are you sure you want to erase all existing user tags?",
      buttons: [
        {
          text: "Reset",
          role: "destructive",
          handler: () => {
            (async () => {
              await dispatch(resetTags());

              presentToast({
                message: "User tags reset",
                color: "success",
              });
            })();
          },
        },
        "Cancel",
      ],
    });
  }

  return (
    <IonItem button onClick={reset} detail={false}>
      <IonLabel color="primary">Reset Tags</IonLabel>
    </IonItem>
  );
}
