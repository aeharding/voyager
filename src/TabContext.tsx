import React, { createContext, useMemo } from "react";
import { useLocation } from "react-router";

interface ITabContext {
  tab: string;
}

export const TabContext = createContext<ITabContext>({
  tab: "",
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

  const tab = location.pathname.split("/")[1];

  const memoized = useMemo(
    () => (
      <TabContextProviderInternals tab={tab}>
        {children}
      </TabContextProviderInternals>
    ),
    [tab, children]
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
  return <TabContext.Provider value={{ tab }}>{children}</TabContext.Provider>;
}
