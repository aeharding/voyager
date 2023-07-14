import React from "react";
import { useAppSelector } from "../../store";
import { Redirect } from "react-router";
import useIonViewIsVisible from "../../helpers/useIonViewIsVisible";
import {
  isModeratorSelector,
  jwtSelector,
} from "../../features/auth/authSlice";

interface ReportAuthRequiredProps {
  children: React.ReactNode;
}

export default function ReportAuthRequired({
  children,
}: ReportAuthRequiredProps) {
  const jwt = useAppSelector(jwtSelector);
  const isModerator = useAppSelector(isModeratorSelector);

  const ionViewIsVisible = useIonViewIsVisible();

  if ((!jwt && ionViewIsVisible) || !isModerator)
    return <Redirect to="/inbox" push={false} />;

  return children;
}
