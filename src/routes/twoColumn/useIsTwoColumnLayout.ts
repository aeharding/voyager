import { useAppSelector } from "#/store";

import useIsViewportTwoColumnCapable from "./useIsViewportTwoColumnCapable";

export default function useIsTwoColumnLayout() {
  const setting = useAppSelector(
    (state) => state.settings.appearance.general.twoColumnLayout,
  );
  const isViewportTwoColumnCapable = useIsViewportTwoColumnCapable();

  return setting && isViewportTwoColumnCapable;
}
