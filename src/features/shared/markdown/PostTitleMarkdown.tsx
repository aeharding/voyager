import { ComponentProps } from "react";

import InlineMarkdown from "./InlineMarkdown";

export default function PostTitleMarkdown(
  props: ComponentProps<typeof InlineMarkdown>,
) {
  return <InlineMarkdown {...props} parseBlocks={false} />;
}
