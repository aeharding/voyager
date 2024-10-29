import { useAppSelector } from "../store";
import { useCallback, useContext, useEffect, useRef } from "react";
import { TabNameContext } from "../routes/common/Route";
import { TabContext } from "../core/TabContext";

export function useBuildGeneralBrowseLink() {
  const { tabRef } = useContext(TabContext);
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );

  const tabName = useContext(TabNameContext);
  const tabNameRef = useRef(tabName);

  useEffect(() => {
    // tab should never dynamically change for a rendered buildGeneralBrowseLink tab. So don't re-render buildGeneralBrowseLink
    tabNameRef.current = tabName;
  });

  const buildGeneralBrowseLink = useCallback(
    (path: string) => {
      const tab = tabNameRef.current || tabRef?.current;
      // /settings/lemmy.world is invalid. Posts tab is special case
      if (tab !== "posts" && (!path || path === "/")) return `/${tab}`;

      return `/${tab}/${connectedInstance}${path}`;
    },
    [connectedInstance, tabRef],
  );

  return buildGeneralBrowseLink;
}
