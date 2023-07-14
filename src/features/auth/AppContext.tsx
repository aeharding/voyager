import { useIonViewDidEnter } from "@ionic/react";
import React, {
  RefObject,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { VirtuosoHandle } from "react-virtuoso";
import getConfig from "../../services/app";

// Only needs to be done once for app load
const config = getConfig();

export type Page = RefObject<VirtuosoHandle | HTMLElement>;

interface IAppContext {
  // used for determining whether page needs to be scrolled up first
  activePage: Page | undefined;
  setActivePage: (activePage: Page) => void;
}

export const AppContext = createContext<IAppContext>({
  activePage: undefined,
  setActivePage: () => {},
});

export function AppContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activePage, setActivePage] = useState<Page | undefined>();
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    config.finally(() => {
      setConfigLoaded(true);
    });
  }, []);

  return (
    <AppContext.Provider value={{ activePage, setActivePage }}>
      {configLoaded ? children : ""}
    </AppContext.Provider>
  );
}

export function useSetActivePage(page?: Page, enabled = true) {
  const { activePage, setActivePage } = useContext(AppContext);

  useEffect(() => {
    if (!enabled) return;

    if (page) setActivePage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useIonViewDidEnter(() => {
    if (!enabled) return;

    if (page) setActivePage(page);
  });

  useEffect(() => {
    if (!enabled) return;
    if (!page) return;

    if (!activePage) {
      setActivePage(page);
      return;
    }

    const current = activePage.current;

    if (current && "querySelector" in current) {
      if (current.classList.contains("ion-page-hidden")) {
        setActivePage(page);
      }
      return;
    }

    if (!current) {
      setActivePage(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);
}
