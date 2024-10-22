import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { updateConnectedInstance } from "../features/auth/authSlice";
import { useLocation } from "react-router";
import { getInboxCounts, syncMessages } from "../features/inbox/inboxSlice";
import { useInterval } from "usehooks-ts";
import usePageVisibility from "../helpers/usePageVisibility";
import { getDefaultServer } from "../services/app";
import BackgroundReportSync from "../features/moderation/BackgroundReportSync";
import { getSiteIfNeeded, isAdminSelector } from "../features/auth/siteSlice";
import { instanceSelector, jwtSelector } from "../features/auth/authSelectors";
import useEvent from "../helpers/useEvent";

interface AuthProps {
  children: React.ReactNode;
}

export default function Auth({ children }: AuthProps) {
  const dispatch = useAppDispatch();
  const jwt = useAppSelector(jwtSelector);
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );

  useEffect(() => {
    dispatch(getSiteIfNeeded());
  }, [dispatch, jwt, connectedInstance]);

  return (
    <>
      <AuthLocation />
      {connectedInstance ? children : undefined}
    </>
  );
}

/**
 * Separate component so that it doesn't rerender react component tree on location change
 */
function AuthLocation() {
  const location = useLocation();

  const dispatch = useAppDispatch();
  const pageVisibility = usePageVisibility();
  const jwt = useAppSelector(jwtSelector);

  const selectedInstance = useAppSelector(instanceSelector);
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );

  const hasModdedSubs = useAppSelector(
    (state) =>
      !!state.site.response?.my_user?.moderates.length ||
      !!isAdminSelector(state),
  );

  const shouldSyncMessages = () => {
    return jwt && location.pathname.startsWith("/inbox/messages");
  };

  const shouldSyncMessagesEvent = useEvent(shouldSyncMessages);

  useEffect(() => {
    if (connectedInstance) return;

    const potentialConnectedInstance = location.pathname.split("/")[2];

    if (
      potentialConnectedInstance &&
      connectedInstance === potentialConnectedInstance
    )
      return;

    if (selectedInstance) {
      dispatch(updateConnectedInstance(selectedInstance));
    } else if (potentialConnectedInstance?.includes(".")) {
      dispatch(updateConnectedInstance(potentialConnectedInstance));
    } else {
      dispatch(updateConnectedInstance(getDefaultServer()));
    }
    // TODO is this right???
  }, [connectedInstance, dispatch, location.pathname, selectedInstance]);

  useInterval(
    () => {
      if (!pageVisibility) return;
      if (!shouldSyncMessagesEvent()) return;

      dispatch(syncMessages());
    },
    shouldSyncMessages() ? 1_000 * 15 : null,
  );

  useInterval(() => {
    if (!pageVisibility) return;
    if (!jwt) return;

    dispatch(getInboxCounts());
  }, 1_000 * 60);

  useEffect(() => {
    if (!pageVisibility) return;

    dispatch(getInboxCounts());
  }, [pageVisibility, jwt, dispatch]);

  useEffect(() => {
    if (!pageVisibility) return;
    if (!shouldSyncMessagesEvent()) return;

    dispatch(syncMessages());
  }, [dispatch, pageVisibility, shouldSyncMessagesEvent]);

  return <>{hasModdedSubs && <BackgroundReportSync />}</>;
}
