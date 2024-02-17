import React from "react";
import { useAppSelector } from "../../../store";
import { Redirect } from "react-router";
import useIonViewIsVisible from "../../../helpers/useIonViewIsVisible";
import { jwtSelector } from "../../../features/auth/authSelectors";

interface InboxAuthRequiredProps {
  children: React.ReactNode;
}

export default function InboxAuthRequired({
  children,
}: InboxAuthRequiredProps) {
  const jwt = useAppSelector(jwtSelector);

  const ionViewIsVisible = useIonViewIsVisible();

  if (!jwt && ionViewIsVisible) return <Redirect to="/inbox" push={false} />;

  return children;
}
