import { IonLabel, IonList } from "@ionic/react";

import { ListHeader } from "#/features/settings/shared/formatting";
import { getPlatform } from "#/helpers/device";
import useIsDeviceTwoColumnCapable from "#/routes/twoColumn/useIsDeviceTwoColumnCapable";

import ShowSystemTitlebar from "./ShowSystemTitlebar";
import TwoColumn from "./TwoColumn";

export default function Layout() {
  const isDeviceTwoColumnCapable = useIsDeviceTwoColumnCapable();

  if (!isDeviceTwoColumnCapable) return;

  return (
    <>
      <ListHeader>
        <IonLabel>Layout</IonLabel>
      </ListHeader>
      <IonList inset>
        <TwoColumn />
        {getPlatform() === "tauri" && <ShowSystemTitlebar />}
      </IonList>
    </>
  );
}
