import { Redirect, useLocation, useParams } from "react-router";
import { useAppSelector } from "./store";
import { jwtIssSelector } from "./features/auth/authSlice";
import React from "react";

interface ActorRedirectProps {
  children?: React.ReactNode;
}

export default function ActorRedirect({ children }: ActorRedirectProps) {
  const { actor } = useParams<{ actor: string }>();
  const iss = useAppSelector(jwtIssSelector);
  const location = useLocation();

  if (!iss || !actor) return <>{children}</>;
  if (iss === actor) return <>{children}</>;

  const [first, second, _wrongActor, ...rest] = location.pathname.split("/");

  return <Redirect to={[first, second, iss, ...rest].join("/")} push={false} />;
}
