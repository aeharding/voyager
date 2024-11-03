import { ImpactStyle } from "@capacitor/haptics";
import { useEffect } from "react";

import useHapticFeedback from "#/helpers/useHapticFeedback";

export default function HapticsListener() {
  const vibrate = useHapticFeedback();

  useEffect(() => {
    const handleToggleChange = (e: Event) => {
      if (!(e.target instanceof HTMLElement)) return;
      if (e.target.tagName !== "ION-TOGGLE") return;

      vibrate({ style: ImpactStyle.Light });
    };

    const handleActionSheetWillPresent = () => {
      vibrate({ style: ImpactStyle.Light });
    };

    document.addEventListener("ionChange", handleToggleChange);
    document.addEventListener(
      "ionActionSheetWillPresent",
      handleActionSheetWillPresent,
    );

    return () => {
      document.removeEventListener("ionChange", handleToggleChange);
      document.removeEventListener(
        "ionActionSheetWillPresent",
        handleActionSheetWillPresent,
      );
    };
  }, [vibrate]);

  return null;
}
