import { useIonViewDidEnter } from "@ionic/react";
import React, {
  RefObject,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { VListHandle } from "virtua";

export type Page = RefObject<VListHandle | HTMLElement>;

interface IAppContext {
  // used for determining whether page needs to be scrolled up first
  activePageRef: RefObject<Page | undefined> | undefined;
  setActivePage: (activePage: Page) => void;
}

export const AppContext = createContext<IAppContext>({
  activePageRef: undefined,
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
      activePageRef,
      setActivePage: (page: Page) => (activePageRef.current = page),
    }),
    [],
  );

  return (
    <AppContext.Provider value={currentValue}>{children}</AppContext.Provider>
  );
}

export function useSetActivePage(page?: Page, enabled = true) {
  const { activePageRef, setActivePage } = useContext(AppContext);

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

    if (!activePageRef?.current) {
      setActivePage(page);
      return;
    }

    const current = activePageRef.current?.current;

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
