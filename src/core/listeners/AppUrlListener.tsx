import { App } from "@capacitor/app";
import { useEffect, useRef } from "react";
import useLemmyUrlHandler from "../../features/shared/useLemmyUrlHandler";
import useEvent from "../../helpers/useEvent";
import { useAppSelector } from "../../store";

export default function AppUrlListener() {
  const { redirectToLemmyObjectIfNeeded } = useLemmyUrlHandler();
  const knownInstances = useAppSelector(
    (state) => state.instances.knownInstances,
  );
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );
  const appUrlToOpen = useRef<string | undefined>();

  const notReady =
    !knownInstances || knownInstances === "pending" || !connectedInstance;

  const onAppUrl = useEvent((url: string) => {
    if (notReady) {
      appUrlToOpen.current = url;
      return;
    }

    redirectToLemmyObjectIfNeeded(url);
  });

  useEffect(() => {
    App.addListener("appUrlOpen", (event) => {
      onAppUrl(event.url);
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
