import { useEffect, useEffectEvent, useRef } from "react";
import { useLocation } from "react-router";

import { useAppPageRef } from "#/helpers/AppPage";
import { isInstalled } from "#/helpers/device";
import { pageTransitionAnimateBackOnly } from "#/helpers/ionic";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";
import { useAppDispatch } from "#/store";

import { appIsReadyToAcceptDeepLinks } from "./deepLinkReadySlice";

function isVisiblePage(element: Element): element is HTMLElement {
  return (
    element instanceof HTMLElement &&
    element.classList.contains("ion-page") &&
    !element.classList.contains("ion-hide") &&
    !element.classList.contains("ion-page-hidden") &&
    !element.classList.contains("ion-page-invisible") &&
    element.style.display !== "none" &&
    element.style.visibility !== "hidden"
  );
}

export default function InitialPageRedirectBootstrapper({
  to,
}: {
  to: string | undefined;
}) {
  const dispatch = useAppDispatch();
  const router = useOptimizedIonRouter();
  const location = useLocation();
  const pageRef = useAppPageRef();
  const runtimeRef = useRef({
    sourcePathname: location.pathname,
    frame: undefined as number | undefined,
    observer: undefined as MutationObserver | undefined,
    navigation: undefined as "bootstrapped" | "bootstrap" | "tab" | undefined,
    bootstrapPath: undefined as string | undefined,
    queuedTab: undefined as HTMLElement | undefined,
    replay: undefined as { handler: () => void; outlet: Element } | undefined,
  });

  function pageIsActive() {
    const page = pageRef?.current;
    const outlet = page?.closest("ion-router-outlet");

    if (!page || !outlet || !page.isConnected || !isVisiblePage(page))
      return false;
    if (location.pathname !== runtimeRef.current.sourcePathname) return false;

    const visiblePages = Array.from(outlet.children).filter(isVisiblePage);
    return visiblePages.length === 1 && visiblePages[0] === page;
  }

  const finishEvent = useEffectEvent((bootstrapped = false) => {
    if (bootstrapped) {
      runtimeRef.current.navigation = "bootstrapped";
      runtimeRef.current.observer?.disconnect();
      runtimeRef.current.observer = undefined;
    }

    dispatch(appIsReadyToAcceptDeepLinks());
  });

  const performRedirectEvent = useEffectEvent(() => {
    const runtime = runtimeRef.current;
    runtime.frame = undefined;

    if (runtime.navigation || to == null || !pageIsActive()) return;

    if (to === "" || to === location.pathname + location.search)
      return finishEvent(true);

    runtime.navigation = "bootstrap";
    runtime.bootstrapPath = to;
    router.push(
      to,
      "forward",
      "push",
      undefined,
      pageTransitionAnimateBackOnly,
    );
  });

  const scheduleRedirectEvent = useEffectEvent(() => {
    const runtime = runtimeRef.current;
    if (runtime.navigation || to == null) return;
    if (runtime.frame !== undefined) return;

    // requestAnimationFrame needed so Ionic can finish some calculations,
    // like --offset-top for <ion-content> needed for IonContent[color="light-bg"] full size header
    runtime.frame = requestAnimationFrame(() => performRedirectEvent());
  });

  useEffect(() => {
    if (!isInstalled()) return;

    const runtime = runtimeRef.current;
    if (runtime.navigation === "bootstrapped") return;
    if (runtime.navigation === "tab") {
      if (location.pathname === runtime.sourcePathname) return;

      runtime.navigation = undefined;
      return finishEvent();
    }
    if (to != null && to === location.pathname + location.search)
      return finishEvent(true);
    if (location.pathname !== runtime.sourcePathname) {
      runtime.navigation = undefined;
      return finishEvent();
    }

    const outlet = pageRef?.current?.closest("ion-router-outlet");
    if (!outlet) return;

    const tabs = outlet.closest("ion-tabs");
    const yieldToTabChange = (event: Event) => {
      const tab = (event as CustomEvent<{ tab?: string }>).detail.tab;

      if (runtime.navigation === "bootstrap") {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (event.target instanceof HTMLElement)
          runtime.queuedTab = event.target;

        if (!runtime.replay) {
          const handler = () => {
            if (router.getRouteInfo()?.pathname !== runtime.bootstrapPath)
              return;

            outlet.removeEventListener("ionNavDidChange", handler);
            runtime.replay = undefined;
            const queuedTab = runtime.queuedTab;
            runtime.queuedTab = undefined;
            finishEvent(true);
            if (queuedTab?.isConnected) queuedTab.click();
          };

          runtime.replay = { handler, outlet };
          outlet.addEventListener("ionNavDidChange", handler);
        }
        return;
      }

      if (
        runtime.navigation === "bootstrapped" ||
        !tab ||
        location.pathname.startsWith(`/${tab}`)
      )
        return;

      runtime.navigation = "tab";
      if (runtime.frame !== undefined) cancelAnimationFrame(runtime.frame);
      runtime.frame = undefined;
    };
    const observer = new MutationObserver(() => scheduleRedirectEvent());
    runtime.observer = observer;
    tabs?.addEventListener("ionTabButtonClick", yieldToTabChange, true);
    observer.observe(outlet, {
      attributeFilter: ["class", "style"],
      attributes: true,
      childList: true,
      subtree: true,
    });
    scheduleRedirectEvent();

    return () => {
      tabs?.removeEventListener("ionTabButtonClick", yieldToTabChange, true);
      observer.disconnect();
      if (runtime.observer === observer) runtime.observer = undefined;
      if (runtime.frame !== undefined) cancelAnimationFrame(runtime.frame);
      runtime.frame = undefined;
    };
  }, [location.pathname, location.search, pageRef, router, to]);

  useEffect(
    () => () => {
      const replay = runtimeRef.current.replay;
      if (replay)
        replay.outlet.removeEventListener("ionNavDidChange", replay.handler);
    },
    [],
  );

  return null;
}
