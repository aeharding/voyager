import { createContext } from "react";
import { use } from "react";

export const IsSecondColumnContext = createContext<boolean>(false);

export function useIsSecondColumn() {
  return use(IsSecondColumnContext);
}
