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

const PENDING_APP_URL_STORAGE_KEY = "app-url";

App.addListener("appUrlOpen", (event) => {
  localStorage.setItem(PENDING_APP_URL_STORAGE_KEY, event.url);
});

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

  const pendingResolveRef = useRef(false);

  const notReady =
    !knownInstances ||
    knownInstances === "pending" ||
    !connectedInstance ||
    !deepLinkReady;

  const onAppUrlIfNeeded = async (potentialUrl?: string) => {
    // wait for router to get into a good state before pushing
    // (needed for pushing user profiles from app startup)
    if (notReady) return;
    if (pendingResolveRef.current) return;

    const url =
      localStorage.getItem(PENDING_APP_URL_STORAGE_KEY) || potentialUrl;

    if (!url) return;

    localStorage.removeItem(PENDING_APP_URL_STORAGE_KEY);

    pendingResolveRef.current = true;

    let result;

    try {
      result = await redirectToLemmyObjectIfNeeded(normalizeObjectUrl(url));
    } finally {
      pendingResolveRef.current = false;
      localStorage.removeItem(PENDING_APP_URL_STORAGE_KEY);
    }

    if (result === "not-found") presentToast(deepLinkFailed);
  };

  const onAppUrlIfNeededEvent = useEffectEvent(onAppUrlIfNeeded);

  useEffect(() => {
    const listener = App.addListener("appUrlOpen", (event) => {
      onAppUrlIfNeededEvent(event.url);
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
