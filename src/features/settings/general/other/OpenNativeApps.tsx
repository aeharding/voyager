import { IonToggle, useIonAlert } from "@ionic/react";
import { InsetIonItem } from "../../../../routes/pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { setPreferNativeApps } from "../../settingsSlice";
import { isNative } from "../../../../helpers/device";

export default function OpenNativeApps() {
  const dispatch = useAppDispatch();
  const linkHandler = useAppSelector(
    (state) => state.settings.general.linkHandler,
  );
  const preferNativeApps = useAppSelector(
    (state) => state.settings.general.preferNativeApps,
  );
  const [presentAlert] = useIonAlert();

  const notAvailable = linkHandler === "default-browser";

  if (!isNative()) return;

  return (
    <InsetIonItem
      onClick={() => {
        if (!notAvailable) return;

        presentAlert(
          'Currently you can only turn off "Prefer Opening Native Apps" if you use the in-app browser.\n\nTo do this, change the "Open Links In" setting to "In App"',
        );
      }}
    >
      <IonToggle
        checked={notAvailable ? true : preferNativeApps}
        onIonChange={(e) => {
          if (notAvailable) {
            e.target.checked = true;
            return;
          }

          dispatch(setPreferNativeApps(e.detail.checked));
        }}
      >
        Prefer Opening Native Apps
      </IonToggle>
    </InsetIonItem>
  );
}
