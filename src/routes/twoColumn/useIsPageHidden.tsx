import { createContext, use } from "react";

export default function useIsPageHidden() {
  return use(HiddenPageContext);
}

export const HiddenPageContext = createContext<boolean>(false);
