import { noop } from "es-toolkit";
import { Location } from "history";
import { createContext } from "react";
import { useState } from "react";

import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";
import { useAppSelector } from "#/store";

import useIsTwoColumnLayout from "./twoColumn/useIsTwoColumnLayout";

type SecondColumnLocationDictionary =
  | Record<string, Location | undefined>
  | undefined;

export default function OutletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useOptimizedIonRouter();

  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );

  const [secondColumnLocationDictionary, setSecondColumnLocationDictionary] =
    useState<SecondColumnLocationDictionary>(undefined);

  function setSecondColumnLocation(location: string | undefined) {
    const tab = router.getRouteInfo()?.pathname.split("/")[1];

    if (!tab) throw new Error("No tab");

    setSecondColumnLocationDictionary({
      ...secondColumnLocationDictionary,
      [tab]: location
        ? {
            pathname: location,
            search: "",
            state: undefined,
            hash: "",
          }
        : undefined,
    });
  }

  const isTwoColumnLayout = useIsTwoColumnLayout();

  const [prevConnectedInstance, setPrevConnectedInstance] =
    useState(connectedInstance);

  if (prevConnectedInstance !== connectedInstance) {
    setPrevConnectedInstance(connectedInstance);
    setSecondColumnLocationDictionary(undefined);
  }

  if (!isTwoColumnLayout && secondColumnLocationDictionary) {
    setSecondColumnLocationDictionary(undefined);
  }

  return (
    <OutletContext
      value={{
        setSecondColumnLocation,
        isTwoColumnLayout,
        secondColumnLocationDictionary,
      }}
    >
      {children}
    </OutletContext>
  );
}

export const OutletContext = createContext<{
  setSecondColumnLocation: (location: string | undefined) => void;
  isTwoColumnLayout: boolean;
  secondColumnLocationDictionary: SecondColumnLocationDictionary;
}>({
  setSecondColumnLocation: noop,
  isTwoColumnLayout: false,
  secondColumnLocationDictionary: undefined,
});
