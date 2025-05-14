import { App } from "@capacitor/app";
import {
  useEffect,
  experimental_useEffectEvent as useEffectEvent,
  useRef,
} from "react";

import { normalizeObjectUrl } from "#/features/resolve/resolveSlice";
import useLemmyUrlHandler from "#/features/shared/useLemmyUrlHandler";
import { extractLemmyLinkFromGoVoyagerLink } from "#/helpers/goVoyager";
import { deepLinkFailed } from "#/helpers/toastMessages";
import useAppToast from "#/helpers/useAppToast";
import { useAppSelector } from "#/store";

export default function AppUrlListener() {
  const { redirectToLemmyObjectIfNeeded } = useLemmyUrlHandler();
  const knownInstances = useAppSelector(
    (state) => state.instances.knownInstances,
  );
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );
  const deepLinkReady = useAppSelector((state) => state.deepLinkReady.ready);

  const appUrlToOpen = useRef<string>(undefined);
  const presentToast = useAppToast();

  const notReady =
    !knownInstances ||
    knownInstances === "pending" ||
    !connectedInstance ||
    !deepLinkReady;

  const onAppUrl = async (url: string) => {
    if (notReady) {
      appUrlToOpen.current = url;
      return;
    }

    const parsedUrl = new URL(url);
    if (!parsedUrl) {
      presentToast(deepLinkFailed);
      return;
    }

    let lemmyLink = url;

    if (parsedUrl.host === "go.getvoyager.app") {
      const potentialLemmyLink = extractLemmyLinkFromGoVoyagerLink(url);
      if (potentialLemmyLink) lemmyLink = potentialLemmyLink;
    }

    // wait for router to get into a good state before pushing
    // (needed for pushing user profiles from app startup)
    const result = await redirectToLemmyObjectIfNeeded(lemmyLink);

    if (result === "not-found") presentToast(deepLinkFailed);
  };

  const onAppUrlEvent = useEffectEvent(onAppUrl);

  useEffect(() => {
    const listener = App.addListener("appUrlOpen", (event) => {
      onAppUrlEvent(normalizeObjectUrl(event.url));
    });

    return () => {
      listener.then((l) => l.remove());
    };
  }, []);

  useEffect(() => {
    if (notReady) return;
    if (!appUrlToOpen.current) return;

    onAppUrlEvent(appUrlToOpen.current);
    appUrlToOpen.current = undefined;
  }, [notReady]);

  return null;
}
