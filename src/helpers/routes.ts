import { useAppSelector } from "../store";
import { useCallback, useContext } from "react";
import { TabNameContext } from "../Route";

export function useBuildGeneralBrowseLink() {
  const connectedServer = useAppSelector(
    (state) => state.auth.connectedInstance,
  );

  const tabName = useContext(TabNameContext);

  const buildGeneralBrowseLink = useCallback(
    (path: string) => `/${tabName}/${connectedServer}${path}`,
    // tab should never dynamically change for a rendered buildGeneralBrowseLink tab. So don't re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [connectedServer],
  );

  return buildGeneralBrowseLink;
}
