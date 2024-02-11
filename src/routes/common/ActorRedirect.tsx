import { Redirect, RouteProps, useLocation, useParams } from "react-router";
import { useAppSelector } from "../../store";
import useIonViewIsVisible from "../../helpers/useIonViewIsVisible";
import { isInstalled } from "../../helpers/device";
import { useMemo } from "react";

export const usingActorRedirect = !isInstalled();

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

  const page = useMemo(() => <>{children}</>, [children]);

  if (!ionViewIsVisible) return page;
  if (!connectedInstance || !actor) return page;
  if (connectedInstance === actor) return page;

  const [first, second, _wrongActor, ...urlEnd] = location.pathname.split("/");

  // no need to redirect if url doesn't have actor
  if (!_wrongActor || !_wrongActor.includes(".")) return page;

  return (
    <Redirect
      to={[first, second, connectedInstance, ...urlEnd].join("/")}
      push={false}
    />
  );
}
