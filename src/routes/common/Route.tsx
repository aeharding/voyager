import { createContext, useContext, useState } from "react";
import { RouteProps } from "react-router-dom";
import { Route as ReactRoute } from "react-router-dom";

import { TabContext } from "#/core/TabContext";

import ActorRedirect from "./ActorRedirect";

type AppRouteProps = Omit<RouteProps, "children"> & React.PropsWithChildren;

export default function Route({ children, ...props }: AppRouteProps) {
  const { tabRef } = useContext(TabContext);
  const [tabName] = useState(() => tabRef?.current ?? "");

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
