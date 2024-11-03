import { App } from "@capacitor/app";
import {
  useEffect,
  experimental_useEffectEvent as useEffectEvent,
  useRef,
} from "react";

import { normalizeObjectUrl } from "#/features/resolve/resolveSlice";
import useLemmyUrlHandler from "#/features/shared/useLemmyUrlHandler";
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

  const appUrlToOpen = useRef<string | undefined>();
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

    // wait for router to get into a good state before pushing
    // (needed for pushing user profiles from app startup)
    const resolved = await redirectToLemmyObjectIfNeeded(url);

    if (!resolved) presentToast(deepLinkFailed);
  };

  const onAppUrlEvent = useEffectEvent(onAppUrl);

  useEffect(() => {
    App.addListener("appUrlOpen", (event) => {
      onAppUrlEvent(normalizeObjectUrl(event.url));
    });
  }, []);

  useEffect(() => {
    if (notReady) return;
    if (!appUrlToOpen.current) return;

    onAppUrlEvent(appUrlToOpen.current);
    appUrlToOpen.current = undefined;
  }, [notReady]);

  return null;
}
