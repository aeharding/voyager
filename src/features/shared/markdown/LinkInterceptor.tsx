import { LinkHTMLAttributes, MouseEvent, useCallback } from "react";
import { useAppSelector } from "../../../store";
import { useIonRouter } from "@ionic/react";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";

export default function LinkInterceptor(
  props: LinkHTMLAttributes<HTMLAnchorElement>
) {
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
      if (url.hostname === connectedInstance && matchedCommunityHandle) {
        e.preventDefault();

        const [communityName, domain] = matchedCommunityHandle;

        if (domain === url.hostname && domain === connectedInstance) {
          router.push(buildGeneralBrowseLink(`/c/${communityName}`));
          return;
        }

        router.push(
          buildGeneralBrowseLink(
            `/c/${communityName}@${domain ?? url.hostname}`
          )
        );
      }
    },
    [buildGeneralBrowseLink, connectedInstance, props.href, router]
  );

  return <a {...props} onClick={onClick} />;
}

function matchLemmyCommunity(
  urlPathname: string
): [string, string] | [string] | null {
  const pattern = /^\/c\/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\/?$/;
  const matches = urlPathname.match(pattern);
  if (matches && matches[1]) {
    const [communityName, domain] = matches[1].split("@");
    if (!domain) return [communityName];
    return [communityName, domain];
  }
  return null;
}
