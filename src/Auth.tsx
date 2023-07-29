import React, { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./store";
import {
  getSiteIfNeeded,
  jwtIssSelector,
  jwtSelector,
  updateConnectedInstance,
} from "./features/auth/authSlice";
import { useLocation } from "react-router";
import { getInboxCounts, syncMessages } from "./features/inbox/inboxSlice";
import { useInterval } from "usehooks-ts";
import usePageVisibility from "./helpers/usePageVisibility";
import { getDefaultServer } from "./services/app";

interface AuthProps {
  children: React.ReactNode;
}

export default function Auth({ children }: AuthProps) {
  const dispatch = useAppDispatch();
  const jwt = useAppSelector(jwtSelector);
  const iss = useAppSelector(jwtIssSelector);
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance
  );
  const location = useLocation();
  const pageVisibility = usePageVisibility();

  useEffect(() => {
    if (!location.pathname.startsWith("/posts")) {
      if (connectedInstance) return;

      dispatch(updateConnectedInstance(iss ?? getDefaultServer()));
    }

    const potentialConnectedInstance = location.pathname.split("/")[2];

    if (connectedInstance === potentialConnectedInstance) return;

    if (potentialConnectedInstance?.includes("."))
      dispatch(updateConnectedInstance(potentialConnectedInstance));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    dispatch(getSiteIfNeeded());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jwt, connectedInstance]);

  const shouldSyncMessages = useCallback(() => {
    return jwt && location.pathname.startsWith("/inbox/messages");
  }, [jwt, location]);

  useInterval(
    () => {
      if (!pageVisibility) return;
      if (!shouldSyncMessages()) return;

      dispatch(syncMessages());
    },
    shouldSyncMessages() ? 1_000 * 15 : null
  );

  useInterval(() => {
    if (!pageVisibility) return;
    if (!jwt) return;

    dispatch(getInboxCounts());
  }, 1_000 * 60);

  useEffect(() => {
    if (!pageVisibility) return;

    dispatch(getInboxCounts());
  }, [pageVisibility, dispatch, jwt]);

  useEffect(() => {
    if (!pageVisibility) return;
    if (!shouldSyncMessages()) return;

    dispatch(syncMessages());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageVisibility]);

  if (!connectedInstance) return;

  return <>{children}</>;
}
