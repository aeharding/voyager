import React, { useContext, useLayoutEffect } from "react";
import { ExtraProps } from "react-markdown";

import { SpoilerContext } from "./Details";

export default function Summary({
  children,
}: React.JSX.IntrinsicElements["summary"] & ExtraProps) {
  const { setLabel } = useContext(SpoilerContext);

  useLayoutEffect(() => {
    setLabel(children);
  }, [children, setLabel]);

  return null;
}
