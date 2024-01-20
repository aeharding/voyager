import { Redirect, useLocation, useParams } from "react-router";
import { useAppSelector } from "./store";
import { instanceSelector } from "./features/auth/authSelectors";
import React from "react";
import useIonViewIsVisible from "./helpers/useIonViewIsVisible";

interface ActorRedirectProps {
  children?: React.ReactNode;
}

export default function ActorRedirect({ children }: ActorRedirectProps) {
  const { actor } = useParams<{ actor: string }>();
  const selectedInstance = useAppSelector(instanceSelector);
  const location = useLocation();
  const ionViewIsVisible = useIonViewIsVisible();

  if (!ionViewIsVisible) return <>{children}</>;
  if (!selectedInstance || !actor) return <>{children}</>;
  if (selectedInstance === actor) return <>{children}</>;

  const [first, second, _wrongActor, ...urlEnd] = location.pathname.split("/");

  return (
    <Redirect
      to={[first, second, selectedInstance, ...urlEnd].join("/")}
      push={false}
    />
  );
}
