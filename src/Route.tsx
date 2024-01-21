import { createContext, useContext, useRef } from "react";
import { TabContext } from "./TabContext";
import { RouteProps } from "react-router-dom";
import { Route as ReactRoute } from "react-router-dom";

export default function Route(props: RouteProps) {
  const { tabRef } = useContext(TabContext);
  const tabNameRef = useRef(tabRef?.current);

  return (
    <TabNameContext.Provider value={tabNameRef?.current || ""}>
      <ReactRoute {...props} />
    </TabNameContext.Provider>
  );
}

export const TabNameContext = createContext("");
