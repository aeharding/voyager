import { useAppSelector } from "../store";
import { useCallback, useContext, useRef, useState } from "react";
import { TabContext } from "../TabContext";

export function useBuildGeneralBrowseLink() {
  const { tabRef } = useContext(TabContext);
  const connectedServer = useAppSelector(
    (state) => state.auth.connectedInstance,
  );

  // If connectedServer changes while we're off-tab, we don't want to
  // change the tab value - just rerender the connectedServer value
  const currentTab = useRef(tabRef?.current);

  const buildGeneralBrowseLink = useCallback(
    (path: string) => `/${currentTab?.current}/${connectedServer}${path}`,
    // tab should never dynamically change for a rendered buildGeneralBrowseLink tab. So don't re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [connectedServer],
  );

  return buildGeneralBrowseLink;
}
