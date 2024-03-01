import { ComponentProps, useContext, useLayoutEffect } from "react";
import { JsxRuntimeComponents } from "react-markdown/lib";
import { SpoilerContext } from "./Details";

export default function Summary({
  children,
}: ComponentProps<JsxRuntimeComponents["summary"]>) {
  const { setLabel } = useContext(SpoilerContext);

  useLayoutEffect(() => {
    setLabel(children);
  }, [children, setLabel]);

  return null;
}
