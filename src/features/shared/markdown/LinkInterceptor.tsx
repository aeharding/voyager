import React, { useCallback, useMemo } from "react";
import styled from "@emotion/styled";
import InAppExternalLink from "../InAppExternalLink";
import useLemmyUrlHandler from "../useLemmyUrlHandler";
import { useAppSelector } from "../../../store";

const LinkInterceptor = styled(LinkInterceptorUnstyled)`
  -webkit-touch-callout: default;
`;

function LinkInterceptorUnstyled({
  onClick: _onClick,
  ...props
}: React.JSX.IntrinsicElements["a"]) {
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );
  const { redirectToLemmyObjectIfNeeded } = useLemmyUrlHandler();

  const absoluteHref = useMemo(() => {
    if (!props.href) return;

    try {
      return new URL(props.href, `https://${connectedInstance}`).href;
    } catch (error) {
      return;
    }
  }, [connectedInstance, props.href]);

  const onClick = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement>) => {
      _onClick?.(e);

      if (!props.href) return;
      if (e.metaKey || e.ctrlKey) return;
      if (e.defaultPrevented) return;

      redirectToLemmyObjectIfNeeded(props.href, e);
    },
    [props.href, redirectToLemmyObjectIfNeeded, _onClick],
  );

  // Sometimes markdown thinks things are URLs that aren't URLs
  if (!absoluteHref) return props.children;

  return (
    <InAppExternalLink
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      href={absoluteHref}
    />
  );
}

export default LinkInterceptor;
