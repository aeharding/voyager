import { useAppSelector } from "../store";
import { useCallback, useContext } from "react";
import { TabNameContext } from "../routes/common/Route";
import { TabContext } from "../core/TabContext";

export function useBuildGeneralBrowseLink() {
  const { tabRef } = useContext(TabContext);
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );

  const tabName = useContext(TabNameContext);

  const buildGeneralBrowseLink = useCallback(
    (path: string) =>
      `/${tabName || tabRef?.current}/${connectedInstance}${path}`,
    // tab should never dynamically change for a rendered buildGeneralBrowseLink tab. So don't re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [connectedInstance],
  );

  return buildGeneralBrowseLink;
}
