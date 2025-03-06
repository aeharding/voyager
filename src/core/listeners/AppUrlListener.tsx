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

const PREVIOUS_APP_URL_STORAGE_KEY = "previous-app-url";

(async () => {
  const response = await App.getLaunchUrl();

  // If normal startup, remove previous app url
  if (!response?.url) localStorage.removeItem(PREVIOUS_APP_URL_STORAGE_KEY);
})();

export default function AppUrlListener() {
  const presentToast = useAppToast();
  const { redirectToLemmyObjectIfNeeded } = useLemmyUrlHandler();
  const knownInstances = useAppSelector(
    (state) => state.instances.knownInstances,
  );
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );
  const deepLinkReady = useAppSelector((state) => state.deepLinkReady.ready);

  const appUrlFromEventRef = useRef<string>(undefined);

  const notReady =
    !knownInstances ||
    knownInstances === "pending" ||
    !connectedInstance ||
    !deepLinkReady;

  const onAppUrlIfNeeded = async () => {
    // wait for router to get into a good state before pushing
    // (needed for pushing user profiles from app startup)
    if (notReady) return;

    // If appUrl received from explicit event, redirect to it
    if (appUrlFromEventRef.current) {
      redirectTo(appUrlFromEventRef.current);
      appUrlFromEventRef.current = undefined;
      return;
    }

    const url = (await App.getLaunchUrl())?.url;

    if (!url) return;

    // If appUrl received from launch, redirect to it if it's not stale
    // (the appUrl could be stale if web process was killed, but native wrapper wasn't)
    if (url === localStorage.getItem(PREVIOUS_APP_URL_STORAGE_KEY)) return;

    redirectTo(url);
  };

  async function redirectTo(url: string) {
    const result = await redirectToLemmyObjectIfNeeded(normalizeObjectUrl(url));

    if (result === "not-found") presentToast(deepLinkFailed);

    localStorage.setItem(PREVIOUS_APP_URL_STORAGE_KEY, url);
  }

  const onAppUrlIfNeededEvent = useEffectEvent(onAppUrlIfNeeded);

  useEffect(() => {
    const listener = App.addListener("appUrlOpen", (event) => {
      appUrlFromEventRef.current = event.url;
      onAppUrlIfNeededEvent();
    });

    return () => {
      listener.then((l) => l.remove());
    };
  }, []);

  useEffect(() => {
    if (notReady) return;

    onAppUrlIfNeededEvent();
  }, [notReady]);

  return null;
}
