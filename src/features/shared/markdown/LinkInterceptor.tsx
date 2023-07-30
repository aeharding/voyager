import { LinkHTMLAttributes, MouseEvent, useCallback } from "react";
import { useAppSelector } from "../../../store";
import { useIonRouter } from "@ionic/react";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import styled from "@emotion/styled";
import InAppExternalLink from "../InAppExternalLink";

const COMMUNITY_RELATIVE_URL =
  /^\/c\/([a-zA-Z0-9._%+-]+(@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})?)\/?$/;

const LinkInterceptor = styled(LinkInterceptorUnstyled)`
  -webkit-touch-callout: default;
`;

function LinkInterceptorUnstyled(props: LinkHTMLAttributes<HTMLAnchorElement>) {
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance
  );
  const router = useIonRouter();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  const onClick = useCallback(
    (e: MouseEvent) => {
      if (!props.href) return;
      if (e.metaKey || e.ctrlKey) return;

      const url = new URL(props.href, `https://${connectedInstance}`);

      const matchedCommunityHandle = matchLemmyCommunity(url.pathname);

      if (!matchedCommunityHandle) return;

      e.preventDefault();
      e.stopPropagation();

      const [communityName, domain] = matchedCommunityHandle;

      if (
        (!domain && url.hostname === connectedInstance) ||
        (domain === url.hostname && domain === connectedInstance)
      ) {
        router.push(buildGeneralBrowseLink(`/c/${communityName}`));
        return;
      }

      router.push(
        buildGeneralBrowseLink(`/c/${communityName}@${domain ?? url.hostname}`)
      );
    },
    [buildGeneralBrowseLink, connectedInstance, props.href, router]
  );

  return (
    <InAppExternalLink
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
    />
  );
}

function matchLemmyCommunity(
  urlPathname: string
): [string, string] | [string] | null {
  const matches = urlPathname.match(COMMUNITY_RELATIVE_URL);
  if (matches && matches[1]) {
    const [communityName, domain] = matches[1].split("@");
    if (!domain) return [communityName];
    return [communityName, domain];
  }
  return null;
}

export default LinkInterceptor;
