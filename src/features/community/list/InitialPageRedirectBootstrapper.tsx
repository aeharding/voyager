import { useIonViewDidEnter } from "@ionic/react";
import {
  useEffect,
  experimental_useEffectEvent as useEffectEvent,
  useRef,
  useState,
} from "react";

import { isInstalled } from "#/helpers/device";
import { pageTransitionAnimateBackOnly } from "#/helpers/ionic";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";
import { useAppDispatch } from "#/store";

import { appIsReadyToAcceptDeepLinks } from "./deepLinkReadySlice";

import styles from "./InitialPageRedirectBootstrapper.module.css";

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
  function redirectIfNeeded() {
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

      // router.push paints on next rAF, so show content then
      // to prevent flicker
      requestAnimationFrame(() => {
        setBootstrapped(true);
      });
    });
  }

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

  const redirectIfNeededEvent = useEffectEvent(redirectIfNeeded);

  useEffect(() => {
    toRef.current = to;

    redirectIfNeededEvent();
  }, [to]);

  if (!isInstalled() || bootstrapped) return null;

  return <div className={styles.loadingOverlay} />;
}
