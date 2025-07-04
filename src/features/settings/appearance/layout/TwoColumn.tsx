import { IonText } from "@ionic/react";

import SettingSelector from "#/features/settings/shared/SettingSelector";
import { OTwoColumnLayout } from "#/services/db/types";
import { useAppSelector } from "#/store";

import { setTwoColumnLayout } from "../../settingsSlice";

export default function TwoColumn() {
  const twoColumnLayout = useAppSelector(
    (state) => state.settings.appearance.general.twoColumnLayout,
  );

  return (
    <SettingSelector
      title={
        <>
          Two Column Mode <IonText color="medium">(beta)</IonText>
        </>
      }
      selected={twoColumnLayout}
      setSelected={setTwoColumnLayout}
      options={OTwoColumnLayout}
    />
  );
}
