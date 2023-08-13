import { useAppSelector } from "../store";
import { useCallback, useContext } from "react";
import { TabContext } from "../TabContext";

export function useBuildGeneralBrowseLink() {
  const { tab } = useContext(TabContext);
  const connectedServer = useAppSelector(
    (state) => state.auth.connectedInstance
  );

  const buildGeneralBrowseLink = useCallback(
    (path: string) => `/${tab}/${connectedServer}${path}`,
    // tab should never dynamically change for a rendered buildGeneralBrowseLink tab. So don't re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [connectedServer]
  );

  return buildGeneralBrowseLink;
}
