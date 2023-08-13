import { useIonViewDidEnter } from "@ionic/react";
import React, {
  RefObject,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { VirtuosoHandle } from "react-virtuoso";

export type Page = RefObject<VirtuosoHandle | HTMLElement>;

interface IAppContext {
  // used for determining whether page needs to be scrolled up first
  activePage: RefObject<Page | undefined> | undefined;
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
  const activePageRef = useRef<Page>();

  const currentValue = useMemo(
    () => ({
      activePage: activePageRef,
      setActivePage: (page: Page) => (activePageRef.current = page),
    }),
    []
  );

  return (
    <AppContext.Provider value={currentValue}>{children}</AppContext.Provider>
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

    const current = activePage.current?.current;

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
