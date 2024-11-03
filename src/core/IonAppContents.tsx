import { TextRecoveryStartupPrompt } from "#/helpers/useTextRecovery";
import TabbedRoutes from "#/routes/TabbedRoutes";

import Auth from "./Auth";
import AppUrlListener from "./listeners/AppUrlListener";
import HapticsListener from "./listeners/HapticsListener";

export default function IonAppContents() {
  return (
    <>
      <HapticsListener />
      <AppUrlListener />
      <TextRecoveryStartupPrompt />

      <Auth>
        <TabbedRoutes />
      </Auth>
    </>
  );
}
