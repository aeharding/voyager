import React from "react";
import { useAppSelector } from "../../store";
import { Redirect } from "react-router";
import UseIonViewIsVisible from "../../helpers/useIonViewIsVisible";
import { jwtSelector } from "../../features/auth/authSlice";

interface InboxAuthRequiredProps {
  children: React.ReactNode;
}

export default function InboxAuthRequired({
  children,
}: InboxAuthRequiredProps) {
  const jwt = useAppSelector(jwtSelector);

  const isVisible = UseIonViewIsVisible();

  if (!jwt && isVisible) return <Redirect to="/inbox" push={false} />;

  return children;
}
