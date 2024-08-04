import { IonItem, IonText, IonToggle } from "@ionic/react";
import { setAutoHideRead } from "../settingsSlice";
import { useAppDispatch } from "../../../store";

export default function Enabled() {
  const dispatch = useAppDispatch();
  //   const autoHideRead = useAppSelector(
  //     (state) => state.settings.general.posts.autoHideRead,
  //   );

  return (
    <IonItem>
      <IonToggle
        checked={true}
        onIonChange={(e) => dispatch(setAutoHideRead(e.detail.checked))}
      >
        Enable User Tags <IonText color="medium">(experimental)</IonText>
      </IonToggle>
    </IonItem>
  );
}
