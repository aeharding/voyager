import { createContext } from "react";
import { RouteProps } from "react-router-dom";
import { Route as ReactRoute } from "react-router-dom";

import { useTabName } from "#/core/TabContext";

import ActorRedirect from "./ActorRedirect";

type AppRouteProps = Omit<RouteProps, "children"> & React.PropsWithChildren;

export default function Route({ children, ...props }: AppRouteProps) {
  const tabName = useTabName();

  const content = (() => {
    if (props.path?.includes("/:actor"))
      return <ActorRedirect>{children}</ActorRedirect>;

    return children;
  })();

  return (
    <TabNameContext value={tabName}>
      <ReactRoute {...props}>{content}</ReactRoute>
    </TabNameContext>
  );
}

export const TabNameContext = createContext("");
