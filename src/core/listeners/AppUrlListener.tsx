import { App } from "@capacitor/app";
import { useEffect, useRef } from "react";
import useLemmyUrlHandler from "../../features/shared/useLemmyUrlHandler";
import useEvent from "../../helpers/useEvent";
import { useAppSelector } from "../../store";
import useAppToast from "../../helpers/useAppToast";
import { deepLinkFailed } from "../../helpers/toastMessages";
import { normalizeObjectUrl } from "../../features/resolve/resolveSlice";

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

  const onAppUrl = useEvent(async (url: string) => {
    if (notReady) {
      appUrlToOpen.current = url;
      return;
    }

    // wait for router to get into a good state before pushing
    // (needed for pushing user profiles from app startup)
    const resolved = await redirectToLemmyObjectIfNeeded(url);

    if (!resolved) presentToast(deepLinkFailed);
  });

  useEffect(() => {
    App.addListener("appUrlOpen", (event) => {
      onAppUrl(normalizeObjectUrl(event.url));
    });
  }, [onAppUrl]);

  useEffect(() => {
    if (notReady) return;
    if (!appUrlToOpen.current) return;

    onAppUrl(appUrlToOpen.current);
    appUrlToOpen.current = undefined;
  }, [notReady, onAppUrl]);

  return null;
}
