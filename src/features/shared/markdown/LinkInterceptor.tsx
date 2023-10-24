import { LinkHTMLAttributes, MouseEvent, useCallback, useMemo } from "react";
import styled from "@emotion/styled";
import InAppExternalLink from "../InAppExternalLink";
import useLemmyUrlHandler from "../useLemmyUrlHandler";
import { isValidUrl } from "../../../helpers/url";

const LinkInterceptor = styled(LinkInterceptorUnstyled)`
  -webkit-touch-callout: default;
`;

function LinkInterceptorUnstyled(props: LinkHTMLAttributes<HTMLAnchorElement>) {
  const { redirectToLemmyObjectIfNeeded: redirectTo } = useLemmyUrlHandler();

  const validUrl = useMemo(
    () => props.href && isValidUrl(props.href),
    [props.href],
  );

  const onClick = useCallback(
    async (e: MouseEvent) => {
      if (!props.href) return;
      if (e.metaKey || e.ctrlKey) return;

      redirectTo(props.href, e);
    },
    [props.href, redirectTo],
  );

  // Sometimes markdown thinks things are URLs that aren't URLs
  if (!validUrl) return props.children;

  return (
    <InAppExternalLink
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
    />
  );
}

export default LinkInterceptor;
