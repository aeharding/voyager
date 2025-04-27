import { OTwoColumnMode } from "#/services/db";
import { useAppSelector } from "#/store";

import useIsLandscape from "./useIsLandscape";
import useIsViewportTwoColumnCapable from "./useIsViewportTwoColumnCapable";

export default function useIsTwoColumnLayout() {
  const setting = useAppSelector(
    (state) => state.settings.appearance.layout.twoColumnMode,
  );
  const isViewportTwoColumnCapable = useIsViewportTwoColumnCapable();
  const isLandscape = useIsLandscape();

  // optimization - bail early before loading media queries
  if (setting === OTwoColumnMode.Off) return false;

  if (isViewportTwoColumnCapable == null || isLandscape == null) return;

  if (!isViewportTwoColumnCapable) return false;

  switch (setting) {
    case OTwoColumnMode.On:
      return true;
    case OTwoColumnMode.LandscapeOnly:
      return isLandscape;
  }
}
