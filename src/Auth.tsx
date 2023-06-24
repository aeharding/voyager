import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./store";
import {
  getSite,
  jwtIssSelector,
  updateConnectedInstance,
} from "./features/auth/authSlice";
import { useLocation } from "react-router";
import { DEFAULT_ACTOR } from "./TabbedRoutes";
import { getInboxCounts, syncMessages } from "./features/inbox/inboxSlice";
import { useInterval } from "usehooks-ts";

interface AuthProps {
  children: React.ReactNode;
}

export default function Auth({ children }: AuthProps) {
  const dispatch = useAppDispatch();
  const jwt = useAppSelector((state) => state.auth.jwt);
  const iss = useAppSelector(jwtIssSelector);
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance
  );
  const location = useLocation();

  useEffect(() => {
    if (!location.pathname.startsWith("/posts")) {
      if (connectedInstance) return;

      dispatch(updateConnectedInstance(iss ?? DEFAULT_ACTOR));
    }

    const potentialConnectedInstance = location.pathname.split("/")[2];

    if (connectedInstance === potentialConnectedInstance) return;

    if (potentialConnectedInstance)
      dispatch(updateConnectedInstance(potentialConnectedInstance));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    dispatch(getSite());
    dispatch(getInboxCounts());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jwt]);

  useInterval(
    () => {
      dispatch(syncMessages());
    },
    jwt && location.pathname.startsWith("/inbox/messages") ? 1_000 * 15 : null
  );

  if (!connectedInstance) return;

  return <>{children}</>;
}
