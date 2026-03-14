import { compareVersions } from "compare-versions";
import { use, useEffect } from "react";

import { SharedDialogContext } from "#/features/auth/SharedDialogContext";
import { setUnsupportedSystemWebviewError } from "#/features/settings/settingsSlice";
import { isAndroid, isNative, ua } from "#/helpers/device";
import { useAppDispatch } from "#/store";

// At least 140 is required for safe area insets
// to work correctly via the Capacitor SystemBars plugin
const MIN_BLINK_VERSION = "140";

export default function UnsupportedWebviewListener() {
  const { presentAppErrorModal } = use(SharedDialogContext);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isNative() || !isAndroid()) return;

    const engine = ua.getEngine();

    if (
      engine.name === "Blink" &&
      engine.version &&
      compareVersions(engine.version, MIN_BLINK_VERSION) < 0
    ) {
      dispatch(setUnsupportedSystemWebviewError(ua.getResult().ua));
      presentAppErrorModal(true);
    }
  }, [dispatch, presentAppErrorModal]);

  return null;
}
