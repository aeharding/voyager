import { Redirect, useLocation, useParams } from "react-router";

import { isInstalled } from "#/helpers/device";
import useIonViewIsVisible from "#/helpers/useIonViewIsVisible";
import { useAppSelector } from "#/store";

export const usingActorRedirect = !isInstalled();

export default function ActorRedirect({ children }: React.PropsWithChildren) {
  if (!usingActorRedirect) return <>{children}</>;

  return <ActorRedirectEnabled>{children}</ActorRedirectEnabled>;
}

function ActorRedirectEnabled({ children }: React.PropsWithChildren) {
  const { actor } = useParams<{ actor: string }>();
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );
  const location = useLocation();
  const ionViewIsVisible = useIonViewIsVisible();

  if (!ionViewIsVisible) return children;
  if (!connectedInstance || !actor) return children;
  if (connectedInstance === actor) return children;

  const [first, second, _wrongActor, ...urlEnd] = location.pathname.split("/");

  // no need to redirect if url doesn't have actor
  if (!_wrongActor || !isPotentialActor(_wrongActor)) return children;

  return (
    <Redirect
      to={[first, second, connectedInstance, ...urlEnd].join("/")}
      push={false}
    />
  );
}

function isPotentialActor(host: string) {
  if (host.includes(".")) return true;
  if (host.includes(":")) return true;

  if (host.startsWith("localhost")) return true;

  return false;
}
