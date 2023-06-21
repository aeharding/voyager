import { IonReactMemoryRouter, IonReactRouter } from "@ionic/react-router";
import { createMemoryHistory } from "history";
import React, { useEffect } from "react";
import { isInstalled } from "./helpers/device";

export default function Router({ children }: { children: React.ReactNode }) {
  const history = createMemoryHistory();

  useEffect(() => {
    const unListen = history.listen(() => {
      window.scrollTo(0, 0);
    });
    return () => {
      unListen();
    };
  }, [history]);

  if (isInstalled())
    return (
      <IonReactMemoryRouter history={history}>{children}</IonReactMemoryRouter>
    );

  return <IonReactRouter>{children}</IonReactRouter>;
}
