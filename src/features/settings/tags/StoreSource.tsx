import { IonItem, IonToggle } from "@ionic/react";
import { setAutoHideRead } from "../settingsSlice";
import { useAppDispatch } from "../../../store";

export default function StoreSource() {
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
        Store Source Link
      </IonToggle>
    </IonItem>
  );
}
