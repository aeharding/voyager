import { createContext } from "react";

interface IPageContext {
  // used for ion presentingElement
  page: HTMLElement | undefined;
}

export const PageContext = createContext<IPageContext>({ page: undefined });
