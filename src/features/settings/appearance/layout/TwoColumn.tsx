import { IonText } from "@ionic/react";

import SettingSelector from "#/features/settings/shared/SettingSelector";
import { OTwoColumnMode } from "#/services/db";
import { useAppSelector } from "#/store";

import { setTwoColumnMode } from "../../settingsSlice";

export default function TwoColumn() {
  const twoColumnMode = useAppSelector(
    (state) => state.settings.appearance.layout.twoColumnMode,
  );

  return (
    <SettingSelector
      title={
        <>
          Two Column Mode <IonText color="medium">(beta)</IonText>
        </>
      }
      selected={twoColumnMode}
      setSelected={setTwoColumnMode}
      options={OTwoColumnMode}
    />
  );
}
