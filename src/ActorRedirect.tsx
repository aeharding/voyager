import { Redirect, useLocation, useParams } from "react-router";
import { useAppSelector } from "./store";
import { jwtIssSelector } from "./features/auth/authSlice";
import React from "react";
import UseIonViewIsVisible from "./helpers/useIonViewIsVisible";

interface ActorRedirectProps {
  children?: React.ReactNode;
}

export default function ActorRedirect({ children }: ActorRedirectProps) {
  const { actor } = useParams<{ actor: string }>();
  const iss = useAppSelector(jwtIssSelector);
  const location = useLocation();
  const ionViewIsVisible = UseIonViewIsVisible();

  if (!ionViewIsVisible) return <>{children}</>;
  if (!iss || !actor) return <>{children}</>;
  if (iss === actor) return <>{children}</>;

  const [first, second, _wrongActor, ...urlEnd] = location.pathname.split("/");

  return (
    <Redirect to={[first, second, iss, ...urlEnd].join("/")} push={false} />
  );
}
