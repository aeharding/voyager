import { IonItem, IonLabel, useIonAlert } from "@ionic/react";
import { resetTags } from "../../tags/userTagSlice";
import { useAppDispatch } from "../../../store";
import useAppToast from "../../../helpers/useAppToast";

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
                centerText: true,
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
