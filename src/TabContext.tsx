import React, {
  MutableRefObject,
  createContext,
  useEffect,
  useMemo,
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
export function TabContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();

  const tab = location.pathname.split("/")[1]!;

  const memoized = useMemo(
    () => (
      <TabContextProviderInternals tab={tab}>
        {children}
      </TabContextProviderInternals>
    ),
    [tab, children],
  );

  return memoized;
}

function TabContextProviderInternals({
  tab,
  children,
}: {
  tab: string;
  children: React.ReactNode;
}) {
  const tabRef = useRef(tab);

  useEffect(() => {
    tabRef.current = tab;
  }, [tab]);

  const value = useMemo(() => ({ tabRef }), []);

  return <TabContext.Provider value={value}>{children}</TabContext.Provider>;
}
