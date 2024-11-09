import { IonItem, IonToggle, useIonAlert } from "@ionic/react";

import { isAndroid, isNative, ua } from "#/helpers/device";
import { useAppDispatch, useAppSelector } from "#/store";

import { setPreferNativeApps } from "../../settingsSlice";

// On Android 9, opening the in-app browser to youtube just opens the youtube app, regardless.
const platformNotSupported =
  !isNative() ||
  (isAndroid() &&
    ua.getOS().name === "Android" &&
    +(ua.getOS().version ?? 13) < 10);

export default function OpenNativeApps() {
  const dispatch = useAppDispatch();
  const linkHandler = useAppSelector(
    (state) => state.settings.general.linkHandler,
  );
  const preferNativeApps = useAppSelector(
    (state) => state.settings.general.preferNativeApps,
  );
  const [presentAlert] = useIonAlert();

  const configurationNotSupported = linkHandler === "default-browser";

  if (platformNotSupported) return;

  return (
    <IonItem
      onClick={() => {
        if (!configurationNotSupported) return;

        presentAlert(
          'Currently you can only turn off "Prefer Opening Native Apps" if you use the in-app browser.\n\nTo do this, change the "Open Links In" setting to "In App"',
        );
      }}
    >
      <IonToggle
        checked={configurationNotSupported ? true : preferNativeApps}
        onIonChange={(e) => {
          if (configurationNotSupported) {
            e.target.checked = true;
            return;
          }

          dispatch(setPreferNativeApps(e.detail.checked));
        }}
      >
        Prefer Opening Native Apps
      </IonToggle>
    </IonItem>
  );
}
