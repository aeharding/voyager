import { Redirect, useLocation, useParams } from "react-router";
import { useAppSelector } from "./store";
import { jwtIssSelector } from "./features/auth/authSlice";
import { useEffect } from "react";
import { useIonRouter } from "@ionic/react";
import { SUPPORTED_SERVERS } from "./helpers/lemmy";

interface ActorRedirectProps {
  children?: React.ReactNode;
}

export default function ActorRedirect({ children }: ActorRedirectProps) {
  const { actor } = useParams<{ actor: string }>();
  const iss = useAppSelector(jwtIssSelector);
  const location = useLocation();

  if (!iss || !actor) return <>{children}</>;
  if (iss === actor) return <>{children}</>;

  const [first, wrongActor, ...rest] = location.pathname.split("/");

  if (!SUPPORTED_SERVERS.includes(actor)) return <UnsupportedServerMessage />;

  return <Redirect to={[first, iss, ...rest].join("/")} push={false} />;
}

function UnsupportedServerMessage() {
  return <>Unsupported lemmy instance</>;
}
