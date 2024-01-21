import { useAppSelector } from "../store";
import { useCallback, useContext } from "react";
import { TabNameContext } from "../Route";
import { TabContext } from "../TabContext";

export function useBuildGeneralBrowseLink() {
  const { tabRef } = useContext(TabContext);
  const connectedServer = useAppSelector(
    (state) => state.auth.connectedInstance,
  );

  const tabName = useContext(TabNameContext);

  const buildGeneralBrowseLink = useCallback(
    (path: string) =>
      `/${tabName || tabRef?.current}/${connectedServer}${path}`,
    // tab should never dynamically change for a rendered buildGeneralBrowseLink tab. So don't re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [connectedServer],
  );

  return buildGeneralBrowseLink;
}
