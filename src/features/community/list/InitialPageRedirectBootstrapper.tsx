import { useCallback, useEffect, useRef, useState } from "react";
import { useIonViewDidEnter } from "@ionic/react";
import { isInstalled } from "../../../helpers/device";
import { useOptimizedIonRouter } from "../../../helpers/useOptimizedIonRouter";
import { styled } from "@linaria/react";
import { pageTransitionAnimateBackOnly } from "../../../helpers/ionic";
import { appIsReadyToAcceptDeepLinks } from "./deepLinkReadySlice";
import { useAppDispatch } from "../../../store";

const LoadingOverlay = styled.div`
  background: var(--ion-background-color);
  position: fixed;
  inset: 0;
  z-index: 1000;
`;

interface InitialPageRedirectBootstrapperProps {
  to: string | undefined;
}

/**
 * This component redirects after the component is mounted,
 * for installed apps only.
 *
 * This improves user experience by always allowing swipe back.
 *
 * Note: This will become unecessary with the resolution of
 * https://github.com/ionic-team/ionic-framework/issues/27892
 */
export default function InitialPageRedirectBootstrapper({
  to,
}: InitialPageRedirectBootstrapperProps) {
  const dispatch = useAppDispatch();
  const router = useOptimizedIonRouter();
  const [bootstrapped, setBootstrapped] = useState(false);
  const viewEnteredRef = useRef(false);

  // Refs needed for when `redirectIfNeeded is called from `useIonViewDidEnter`
  // (otherwise may be undefined)
  const toRef = useRef(to);
  const bootstrappedRef = useRef(bootstrapped);

  /**
   * Important: must access refs, cannot access state hooks
   * (for calls via `useIonViewDidEnter`)
   */
  const redirectIfNeeded = useCallback(() => {
    const to = toRef.current;
    const bootstrapped = bootstrappedRef.current;

    if (!isInstalled()) return;
    if (!viewEnteredRef.current) return;
    if (to == null) return;
    if (bootstrapped) return;

    // user set default page = communities list. We're already there.
    if (to === "") {
      setBootstrapped(true);
      return;
    }

    // requestAnimationFrame needed so Ionic can finish some calculations,
    // like --offset-top for <ion-content> needed for grey-bg (full size header)
    requestAnimationFrame(() => {
      router.push(
        to,
        "forward",
        "push",
        undefined,
        pageTransitionAnimateBackOnly,
      );

      setBootstrapped(true);
    });
  }, [router]);

  useIonViewDidEnter(() => {
    viewEnteredRef.current = true;

    redirectIfNeeded();
  });

  useEffect(() => {
    bootstrappedRef.current = bootstrapped;

    // Kinda a hack - but helps deep link determine if ready for route push.
    // Only needs to be done once on app startup
    if (bootstrapped) dispatch(appIsReadyToAcceptDeepLinks());
  }, [bootstrapped, dispatch]);

  useEffect(() => {
    toRef.current = to;

    redirectIfNeeded();
  }, [to, redirectIfNeeded]);

  if (!isInstalled() || bootstrapped) return null;

  return <LoadingOverlay />;
}
