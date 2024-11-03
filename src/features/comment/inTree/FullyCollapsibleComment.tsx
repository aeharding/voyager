import { ComponentProps } from "react";
import AnimateHeight from "react-animate-height";

import Comment from "../Comment";

interface CollapsibleCommentProps extends ComponentProps<typeof Comment> {
  fullyCollapsed?: boolean;
}

export default function FullyCollapsibleComment({
  fullyCollapsed,
  ...rest
}: CollapsibleCommentProps) {
  return (
    <AnimateHeight duration={200} height={fullyCollapsed ? 0 : "auto"}>
      <Comment {...rest} />
    </AnimateHeight>
  );
}
