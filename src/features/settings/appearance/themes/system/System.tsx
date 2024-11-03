import { IonLabel, IonList } from "@ionic/react";

import { ListHeader } from "#/features/settings/shared/formatting";
import { isAndroid, isNative } from "#/helpers/device";
import { useAppSelector } from "#/store";

import DarkMode from "./DarkMode";
import DeviceMode from "./DeviceMode";
import QuickSwitchDarkMode from "./QuickSwitchDarkMode";
import UserDarkMode from "./UserDarkMode";

export default function System() {
  const { usingSystemDarkMode } = useAppSelector(
    (state) => state.settings.appearance.dark,
  );

  return (
    <>
      <ListHeader>
        <IonLabel>System</IonLabel>
      </ListHeader>
      <IonList inset>
        {!isNative() || isAndroid() ? <DeviceMode /> : undefined}
        <DarkMode />
      </IonList>

      {!usingSystemDarkMode && (
        <>
          <UserDarkMode />
          <QuickSwitchDarkMode />
        </>
      )}
    </>
  );
}
