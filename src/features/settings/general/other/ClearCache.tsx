import { CapacitorCookies } from "@capacitor/core";
import { IonItem, IonLabel, IonLoading, useIonAlert } from "@ionic/react";
import { ClearCache as CapClearCache } from "capacitor-clear-cache";
import { useState } from "react";

import { isAppleDeviceInstallable, isNative } from "#/helpers/device";
import { cacheClearFailed, cacheClearSuccess } from "#/helpers/toastMessages";
import useAppToast from "#/helpers/useAppToast";

export default function ClearCache() {
  const presentToast = useAppToast();
  const [presentAlert] = useIonAlert();
  const [loading, setLoading] = useState(false);

  function clear() {
    presentAlert({
      header: "Clear cached data",
      message:
        'Note: This should clear most data. However, you may still see Voyager consuming 100mb of "Documents & Data" in iOS Settings. This is data cached by the operating system that Voyager cannot clear.',
      buttons: [
        {
          text: "Clear Cache",
          handler: () => {
            (async () => {
              setLoading(true);
              try {
                await CapClearCache.clear();
                await CapacitorCookies.clearAllCookies();
              } catch (error) {
                presentToast(cacheClearFailed);
                throw error;
              } finally {
                setLoading(false);
              }

              presentToast(cacheClearSuccess);
            })();
          },
        },
        {
          text: "Cancel",
        },
      ],
    });
  }

  if (!isNative() || !isAppleDeviceInstallable()) return;

  return (
    <>
      <IonLoading isOpen={loading} />
      <IonItem button onClick={clear} detail={false}>
        <IonLabel color="primary">Clear Cache</IonLabel>
      </IonItem>
    </>
  );
}
