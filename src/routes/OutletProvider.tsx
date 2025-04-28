import { noop } from "es-toolkit";
import { Location } from "history";
import { createContext } from "react";
import { useEffect, useState } from "react";

import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";

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

  useEffect(() => {
    if (isTwoColumnLayout) return;

    setSecondColumnLocationDictionary(undefined);
  }, [isTwoColumnLayout]);

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
