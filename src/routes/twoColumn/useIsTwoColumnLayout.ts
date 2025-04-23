import { OTwoColumnLayout } from "#/services/db";
import { useAppSelector } from "#/store";

import useIsLandscape from "./useIsLandscape";
import useIsViewportTwoColumnCapable from "./useIsViewportTwoColumnCapable";

export default function useIsTwoColumnLayout() {
  const setting = useAppSelector(
    (state) => state.settings.appearance.general.twoColumnLayout,
  );
  const isViewportTwoColumnCapable = useIsViewportTwoColumnCapable();
  const isLandscape = useIsLandscape();

  if (!isViewportTwoColumnCapable) return false;

  switch (setting) {
    case OTwoColumnLayout.On:
      return true;
    case OTwoColumnLayout.LandscapeOnly:
      return isLandscape;
    case OTwoColumnLayout.Off:
      return false;
  }
}
