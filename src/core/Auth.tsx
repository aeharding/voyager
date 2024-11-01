import React, {
  useCallback,
  useEffect,
  experimental_useEffectEvent as useEffectEvent,
} from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { updateConnectedInstance } from "../features/auth/authSlice";
import { useLocation } from "react-router";
import { getInboxCounts, syncMessages } from "../features/inbox/inboxSlice";
import { useDocumentVisibility, useInterval } from "@mantine/hooks";
import { getDefaultServer } from "../services/app";
import BackgroundReportSync from "../features/moderation/BackgroundReportSync";
import { getSiteIfNeeded, isAdminSelector } from "../features/auth/siteSlice";
import { instanceSelector, jwtSelector } from "../features/auth/authSelectors";

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
  const documentState = useDocumentVisibility();
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

  const shouldSyncMessages = useCallback(() => {
    return jwt && location.pathname.startsWith("/inbox/messages");
<<<<<<< Updated upstream
  }, [jwt, location.pathname]);
=======
  };
>>>>>>> Stashed changes

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

  const { start, stop } = useInterval(() => {
    if (documentState === "hidden") return;
    if (!shouldSyncMessages()) return;

    dispatch(syncMessages());
  }, 1_000 * 15);

  const startEvent = useEffectEvent(start);
  const stopEvent = useEffectEvent(stop);

  useEffect(() => {
    if (shouldSyncMessages()) startEvent();
    else stopEvent();
  }, [shouldSyncMessages]);

  useInterval(
    () => {
<<<<<<< Updated upstream
      if (documentState === "hidden") return;
      if (!jwt) return;
=======
      if (!pageVisibility) return;
      if (!shouldSyncMessages()) return;
>>>>>>> Stashed changes

      dispatch(getInboxCounts());
    },
    1_000 * 60,
    { autoInvoke: true },
  );

  useEffect(() => {
    if (documentState === "hidden") return;

    dispatch(getInboxCounts());
  }, [documentState, jwt, dispatch]);

  const shouldSyncMessagesEvent = useEffectEvent(shouldSyncMessages);

  useEffect(() => {
<<<<<<< Updated upstream
    if (documentState === "hidden") return;
=======
    if (!pageVisibility) return;

    dispatch(getInboxCounts());
  }, [pageVisibility, jwt, dispatch]);

  const shouldSyncMessagesEvent = useEffectEvent(shouldSyncMessages);

  useEffect(() => {
    if (!pageVisibility) return;
>>>>>>> Stashed changes
    if (!shouldSyncMessagesEvent()) return;

    dispatch(syncMessages());
  }, [dispatch, documentState]);

  if (!hasModdedSubs) return;

  return <BackgroundReportSync />;
}
