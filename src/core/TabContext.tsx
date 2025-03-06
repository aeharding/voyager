import React, {
  createContext,
  MutableRefObject,
  useEffect,
  useRef,
} from "react";
import { useLocation } from "react-router";

interface ITabContext {
  tabRef: MutableRefObject<string> | undefined;
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
