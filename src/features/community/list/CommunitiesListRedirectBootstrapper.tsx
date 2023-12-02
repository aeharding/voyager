import { useAppSelector } from "../../../store";
import { jwtIssSelector } from "../../auth/authSlice";
import { useRef, useState } from "react";
import {
  TransitionOptions,
  createAnimation,
  iosTransitionAnimation,
  mdTransitionAnimation,
  useIonViewDidEnter,
} from "@ionic/react";
import { getPathForFeed } from "../../../TabbedRoutes";
import { DefaultFeedType, ODefaultFeedType } from "../../../services/db";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { isInstalled } from "../../../helpers/device";
import styled from "@emotion/styled";
import { useOptimizedIonRouter } from "../../../helpers/useOptimizedIonRouter";

const LoadingOverlay = styled.div`
  background: black;
  position: fixed;
  inset: 0;
  z-index: 1000;
`;

/**
 * This component redirects after the Communities List is mounted,
 * for installed apps only.
 *
 * This improves user experience by always allowing swipe back.
 *
 * Note: This will become unecessary with the resolution of
 * https://github.com/ionic-team/ionic-framework/issues/27892
 */
export default function CommunitiesListRedirectBootstrapper() {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const router = useOptimizedIonRouter();
  const [bootstrapped, setBootstrapped] = useState(false);

  const defaultFeed = useAppSelector(
    (state) => state.settings.general.defaultFeed,
  );
  const iss = useAppSelector(jwtIssSelector);
  const firstEnter = useRef(true);

  useIonViewDidEnter(() => {
    if (!firstEnter.current) return;
    firstEnter.current = false;

    if (!isInstalled()) return;

    requestAnimationFrame(() => {
      router.push(
        buildGeneralBrowseLink(getBaseRoute(!!iss, defaultFeed)),
        "forward",
        "push",
        undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (baseEl: any, opts: TransitionOptions) => {
          // Do not animate into view
          if (opts.direction === "forward") return createAnimation();

          return opts.mode === "ios"
            ? iosTransitionAnimation(baseEl, opts)
            : mdTransitionAnimation(baseEl, opts);
        },
      );

      requestAnimationFrame(() => setBootstrapped(true));
    });
  });

  if (!isInstalled() || bootstrapped) return null;
  return <LoadingOverlay />;
}

export function getBaseRoute(
  loggedIn: boolean,
  defaultFeed: DefaultFeedType | undefined,
): string {
  if (loggedIn)
    return getPathForFeed(defaultFeed || { type: ODefaultFeedType.Home });

  return "/all";
}
