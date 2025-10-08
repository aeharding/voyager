import { App } from "@capacitor/app";
import { useEffect, useEffectEvent, useRef } from "react";

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

    let result;

    try {
      result = await redirectToLemmyObjectIfNeeded(url);
    } catch (error) {
      presentToast(deepLinkFailed);
      throw error;
    }

    if (result === "not-found") presentToast(deepLinkFailed);
  };

  const onAppUrlEvent = useEffectEvent(onAppUrl);

  useEffect(() => {
    const listener = App.addListener("appUrlOpen", (event) => {
      onAppUrlEvent(event.url);
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
