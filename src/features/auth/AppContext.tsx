import { RefObject, createContext } from "react";
import { VirtuosoHandle } from "react-virtuoso";

interface IAppContext {
  // used for determining whether page needs to be scrolled up first
  activePage: HTMLElement | RefObject<VirtuosoHandle> | undefined;
  setActivePage: (activePage: HTMLElement | RefObject<VirtuosoHandle>) => void;
}

export const AppContext = createContext<IAppContext>({
  activePage: undefined,
  setActivePage: () => {},
});
