import React from "react";
import { useAppSelector } from "../../store";
import { Redirect } from "react-router";
import UseIonViewIsVisible from "../../helpers/useIonViewIsVisible";

interface InboxAuthRequiredProps {
  children: React.ReactNode;
}

export default function InboxAuthRequired({
  children,
}: InboxAuthRequiredProps) {
  const jwt = useAppSelector((state) => state.auth.jwt);

  const isVisible = UseIonViewIsVisible();

  if (!jwt && isVisible) return <Redirect to="/inbox" push={false} />;

  return children;
}
