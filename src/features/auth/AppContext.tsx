import { useIonViewDidEnter } from "@ionic/react";
import { noop } from "es-toolkit";
import React, {
  createContext,
  RefObject,
  useContext,
  useEffect,
  useRef,
} from "react";
import { VListHandle } from "virtua";

export type Page = RefObject<VListHandle | HTMLElement | null>;

interface IAppContext {
  // used for determining whether page needs to be scrolled up first
  activePageRef: RefObject<Page | undefined> | undefined;
  setActivePage: (activePage: Page) => void;
}

export const AppContext = createContext<IAppContext>({
  activePageRef: undefined,
  setActivePage: noop,
});

export function AppContextProvider({ children }: React.PropsWithChildren) {
  const activePageRef = useRef<Page>(undefined);

  return (
    <AppContext
      value={{
        activePageRef,
        setActivePage: (page: Page) => (activePageRef.current = page),
      }}
    >
      {children}
    </AppContext>
  );
}

export function useSetActivePage(page?: Page, enabled = true) {
  const { activePageRef, setActivePage } = useContext(AppContext);

  useEffect(() => {
    if (!enabled) return;
    if (activePageRef?.current === page) return;

    if (page) setActivePage(page);
  }, [activePageRef, enabled, page, setActivePage]);

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
  }, [activePageRef, enabled, page, setActivePage]);
}
