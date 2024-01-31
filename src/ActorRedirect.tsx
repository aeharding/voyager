import { Redirect, RouteProps, useLocation, useParams } from "react-router";
import { useAppSelector } from "./store";
import useIonViewIsVisible from "./helpers/useIonViewIsVisible";
import { isNative } from "./helpers/device";

export const usingActorRedirect = isNative();

interface ActorRedirectProps {
  children?: RouteProps["children"];
}

export default function ActorRedirect({ children }: ActorRedirectProps) {
  if (!usingActorRedirect) return <>{children}</>;

  return <ActorRedirectEnabled>{children}</ActorRedirectEnabled>;
}

function ActorRedirectEnabled({ children }: ActorRedirectProps) {
  const { actor } = useParams<{ actor: string }>();
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );
  const location = useLocation();
  const ionViewIsVisible = useIonViewIsVisible();

  if (!ionViewIsVisible) return <>{children}</>;
  if (!connectedInstance || !actor) return <>{children}</>;
  if (connectedInstance === actor) return <>{children}</>;

  const [first, second, _wrongActor, ...urlEnd] = location.pathname.split("/");

  // no need to redirect if url doesn't have actor
  if (!_wrongActor || !_wrongActor.includes(".")) return <>{children}</>;

  return (
    <Redirect
      to={[first, second, connectedInstance, ...urlEnd].join("/")}
      push={false}
    />
  );
}
