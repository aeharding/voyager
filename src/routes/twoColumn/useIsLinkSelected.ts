import { use } from "react";
import { matchPath } from "react-router";

import { useTabName } from "#/core/TabContext";

import { OutletContext } from "../OutletProvider";

export default function useIsLinkSelected(routerLink: string) {
  const { secondColumnLocationDictionary } = use(OutletContext);
  const tabName = useTabName();

  if (!tabName || !secondColumnLocationDictionary) return false;

  const currentSecondColumnLocation = secondColumnLocationDictionary[tabName];

  if (!currentSecondColumnLocation) return false;

  return matchPath(currentSecondColumnLocation.pathname, {
    path: routerLink,
    exact: true,
    strict: true,
  });
}
