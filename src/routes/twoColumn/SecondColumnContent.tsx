import { use } from "react";
import { Switch, useLocation } from "react-router-dom";

import { loggedInSelector } from "#/features/auth/authSelectors";
import anyPane from "#/routes/tabs/anyPane";
import { useAppSelector } from "#/store";

import { OutletContext } from "../OutletProvider";
import TwoColumnEmpty from "./TwoColumnEmpty";
import { HiddenPageContext } from "./useIsPageHidden";
import { IsSecondColumnContext } from "./useIsSecondColumn";

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
          ([tab, currSecondColumnLocation]) => {
            if (!currSecondColumnLocation) return;

            return (
              <HiddenPageContext
                value={currSecondColumnLocation !== secondColumnLocation}
                key={`${tab}${currSecondColumnLocation.pathname}`}
              >
                <Switch location={currSecondColumnLocation}>
                  {...anyPane}
                </Switch>
              </HiddenPageContext>
            );
          },
        )}
      {shouldShowEmpty() && <TwoColumnEmpty />}
    </IsSecondColumnContext>
  );
}
