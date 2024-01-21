import { Redirect, RouteProps, useLocation, useParams } from "react-router";
import { useAppSelector } from "./store";
import { instanceSelector } from "./features/auth/authSelectors";
import React from "react";
import useIonViewIsVisible from "./helpers/useIonViewIsVisible";
import { isNative } from "./helpers/device";

interface ActorRedirectProps {
  children?: RouteProps["children"];
}

export default function ActorRedirect({ children }: ActorRedirectProps) {
  if (isNative()) return <>{children}</>;

  return <ActorRedirectEnabled>{children}</ActorRedirectEnabled>;
}

function ActorRedirectEnabled({ children }: ActorRedirectProps) {
  const { actor } = useParams<{ actor: string }>();
  const selectedInstance = useAppSelector(instanceSelector);
  const location = useLocation();
  const ionViewIsVisible = useIonViewIsVisible();

  if (!ionViewIsVisible) return <>{children}</>;
  if (!selectedInstance || !actor) return <>{children}</>;
  if (selectedInstance === actor) return <>{children}</>;

  const [first, second, _wrongActor, ...urlEnd] = location.pathname.split("/");

  // no need to redirect if url doesn't have actor
  if (!_wrongActor) return <>{children}</>;

  return (
    <Redirect
      to={[first, second, selectedInstance, ...urlEnd].join("/")}
      push={false}
    />
  );
}
