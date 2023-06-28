import { useIonViewDidEnter } from "@ionic/react";
import React, {
  RefObject,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { VirtuosoHandle } from "react-virtuoso";

type Page = HTMLElement | RefObject<VirtuosoHandle>;

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
  const [activePage, setActivePage] = useState<
    HTMLElement | React.RefObject<VirtuosoHandle> | undefined
  >();

  return (
    <AppContext.Provider value={{ activePage, setActivePage }}>
      {children}
    </AppContext.Provider>
  );
}

export function useSetActivePage(page?: Page) {
  const { activePage, setActivePage } = useContext(AppContext);

  useIonViewDidEnter(() => {
    if (page) setActivePage(page);
  });

  useEffect(() => {
    if (!activePage && page) setActivePage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);
}
