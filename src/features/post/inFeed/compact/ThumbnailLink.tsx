import { ComponentProps } from "react";

import usePostLinkLongPress from "#/features/post/link/usePostLinkLongPress";
import InAppExternalLink from "#/features/shared/InAppExternalLink";

export default function ThumbnailLink(
  props: ComponentProps<typeof InAppExternalLink>,
) {
  const { bind } = usePostLinkLongPress(props.href);

  return <InAppExternalLink {...props} {...bind()} />;
}
