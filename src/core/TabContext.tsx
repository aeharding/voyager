import React, {
  createContext,
  RefObject,
  use,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router";

interface ITabContext {
  tabRef: RefObject<string> | undefined;
}

export const TabContext = createContext<ITabContext>({
  tabRef: undefined,
});

/**
 * The reason for this, instead of useLocation() in components directly to get tab name,
 * is that it does not trigger a rerender on navigation changes.
 */
export function TabContextProvider({ children }: React.PropsWithChildren) {
  const location = useLocation();

  const tab = location.pathname.split("/")[1]!;

  return (
    <TabContextProviderInternals tab={tab}>
      {children}
    </TabContextProviderInternals>
  );
}

function TabContextProviderInternals({
  tab,
  children,
}: React.PropsWithChildren<{
  tab: string;
}>) {
  const tabRef = useRef(tab);

  useEffect(() => {
    tabRef.current = tab;
  }, [tab]);

  return <TabContext value={{ tabRef }}>{children}</TabContext>;
}

/**
 * Cache tab name on mount. Do not update on navigation changes
 * (assumes component can't be moved between tabs)
 *
 * This is an optimization and it kinda breaks the rules of React,
 * so disable compiler
 */
export function useTabName() {
  // eslint-disable-next-line react-hooks/react-compiler
  "use no memo";

  const { tabRef } = use(TabContext);

  const [tabName] = useState(() => tabRef?.current ?? "");

  return tabName;
}
