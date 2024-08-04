import React, { useCallback, useMemo } from "react";
import InAppExternalLink from "../InAppExternalLink";
import useLemmyUrlHandler from "../useLemmyUrlHandler";
import { useAppSelector } from "../../../store";
import { styled } from "@linaria/react";

const LinkInterceptor = styled(LinkInterceptorUnstyled)`
  -webkit-touch-callout: default;
`;

type LinkInterceptorUnstyledProps = React.JSX.IntrinsicElements["a"] & {
  el?: "div";

  /**
   * If we know the link is from Lemmy, force it to be resolved.
   * This helps on new instances that aren't fully federated.
   */
  forceResolveObject?: boolean;
};

function LinkInterceptorUnstyled({
  onClick: _onClick,
  forceResolveObject,
  ...props
}: LinkInterceptorUnstyledProps) {
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );
  const { redirectToLemmyObjectIfNeeded } = useLemmyUrlHandler();

  const absoluteHref = useMemo(() => {
    if (!props.href) return;

    try {
      return new URL(props.href, `https://${connectedInstance}`).href;
    } catch (_) {
      return;
    }
  }, [connectedInstance, props.href]);

  const onClick = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement>) => {
      _onClick?.(e);

      if (!props.href) return;
      if (e.metaKey || e.ctrlKey) return;
      if (e.defaultPrevented) return;

      redirectToLemmyObjectIfNeeded(props.href, e, forceResolveObject);
    },
    [props.href, redirectToLemmyObjectIfNeeded, _onClick, forceResolveObject],
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
