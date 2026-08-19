import { createContext } from "react";
import { Route } from "react-router-dom";

import { useTabName } from "#/core/TabContext";

import ActorRedirect from "./ActorRedirect";

export const TabNameContext = createContext("");

/**
 * Builds a react-router `<Route>` element.
 *
 * Must return a real `Route` element (not wrap one in a component):
 * Ionic's router outlet only recognizes direct `Route` children,
 * silently dropping anything else.
 */
export default function route(path: string, children: React.ReactNode) {
  return (
    <Route
      key={path}
      path={path}
      element={<RouteContents path={path}>{children}</RouteContents>}
    />
  );
}

function RouteContents({
  path,
  children,
}: React.PropsWithChildren<{ path: string }>) {
  const tabName = useTabName();

  const content = (() => {
    if (path.includes("/:actor"))
      return <ActorRedirect>{children}</ActorRedirect>;

    return children;
  })();

  return <TabNameContext value={tabName}>{content}</TabNameContext>;
}
