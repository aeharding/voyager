import { use } from "react";
import { Routes, useLocation } from "react-router-dom";

import { loggedInSelector } from "#/features/auth/authSelectors";
import { secondColumnPaneRouteElements } from "#/routes/tabs/shared/secondColumnPaneRoutes";
import { useAppSelector } from "#/store";

import { OutletContext } from "../OutletProvider";
import TwoColumnEmpty from "./TwoColumnEmpty";
import { HiddenPageContext } from "./useIsPageHidden";
import { IsSecondColumnContext } from "./useIsSecondColumn";

/** Match [`SecondColumnPaneRoutes`](src/routes/tabs/shared/secondColumnPaneRoutes.tsx) paths without duplicating `/:tab`. */
function locationWithinTab(
  location: { pathname: string; search: string; hash: string; state?: unknown },
  tab: string,
) {
  const prefix = `/${tab}`;
  let pathname = location.pathname;
  if (pathname === prefix) pathname = "/";
  else if (pathname.startsWith(`${prefix}/`))
    pathname = pathname.slice(prefix.length);
  return { ...location, pathname };
}

export default function SecondColumnContent() {
  const loggedIn = useAppSelector(loggedInSelector);
  const { secondColumnLocationDictionary, isTwoColumnLayout } =
    use(OutletContext);

  const tab = useLocation().pathname.split("/")[1];

  if (!isTwoColumnLayout) return;

  const secondColumnLocation =
    tab && secondColumnLocationDictionary
      ? secondColumnLocationDictionary[tab]
      : undefined;

  function shouldShowEmpty() {
    if (secondColumnLocation) return false;

    // show full screen empty state on profile tab when logged out
    if (!loggedIn && tab === "profile") return false;

    return true;
  }

  return (
    <IsSecondColumnContext value={true}>
      {secondColumnLocationDictionary &&
        Object.entries(secondColumnLocationDictionary).map(
          ([tabKey, currSecondColumnLocation]) => {
            if (!currSecondColumnLocation) return;

            return (
              <HiddenPageContext
                value={currSecondColumnLocation !== secondColumnLocation}
                key={`${tabKey}${currSecondColumnLocation.pathname}`}
              >
                <Routes
                  location={locationWithinTab(
                    currSecondColumnLocation,
                    tabKey,
                  )}
                >
                  {...secondColumnPaneRouteElements(tabKey)}
                </Routes>
              </HiddenPageContext>
            );
          },
        )}
      {shouldShowEmpty() && <TwoColumnEmpty />}
    </IsSecondColumnContext>
  );
}
