import { useContext, useLayoutEffect } from "react";
import { SpoilerContext } from "./Details";
import { ExtraProps } from "react-markdown";

export default function Summary({
  children,
}: JSX.IntrinsicElements["summary"] & ExtraProps) {
  const { setLabel } = useContext(SpoilerContext);

  useLayoutEffect(() => {
    setLabel(children);
  }, [children, setLabel]);

  return null;
}
