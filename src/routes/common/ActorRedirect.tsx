import { useLayoutEffect } from "react";
import { useLocation } from "react-router";

import { isInstalled } from "#/helpers/device";
import useIonViewIsVisible from "#/helpers/useIonViewIsVisible";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";
import { useAppSelector } from "#/store";

export const usingActorRedirect = !isInstalled();

export default function ActorRedirect({ children }: React.PropsWithChildren) {
  if (!usingActorRedirect) return <>{children}</>;

  return <ActorRedirectEnabled>{children}</ActorRedirectEnabled>;
}

function ActorRedirectEnabled({ children }: React.PropsWithChildren) {
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );
  const location = useLocation();
  const ionViewIsVisible = useIonViewIsVisible();
  const router = useOptimizedIonRouter();

  useLayoutEffect(() => {
    if (!ionViewIsVisible) return;

    const [first, second, _wrongActor, ...urlEnd] =
      location.pathname.split("/");

    // no need to redirect if url doesn't have actor
    if (!_wrongActor || !isPotentialActor(_wrongActor)) return;

    if (!connectedInstance || !_wrongActor) return;
    if (connectedInstance === _wrongActor) return;

    requestAnimationFrame(() => {
      router.push(
        [first, second, connectedInstance, ...urlEnd].join("/"),
        "root",
        "replace",
      );
    });
  }, [
    children,
    connectedInstance,
    ionViewIsVisible,
    location.pathname,
    router,
  ]);

  return children;
}

function isPotentialActor(host: string) {
  if (host.includes(".")) return true;
  if (host.includes(":")) return true;

  if (host.startsWith("localhost")) return true;

  return false;
}
