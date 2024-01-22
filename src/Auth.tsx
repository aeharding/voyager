import React, { useCallback, useContext, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "./store";
import { updateConnectedInstance } from "./features/auth/authSlice";
import { useLocation } from "react-router";
import { getInboxCounts, syncMessages } from "./features/inbox/inboxSlice";
import { useInterval } from "usehooks-ts";
import usePageVisibility from "./helpers/usePageVisibility";
import { getDefaultServer } from "./services/app";
import { isLemmyError } from "./helpers/lemmy";
import useAppToast from "./helpers/useAppToast";
import BackgroundReportSync from "./features/moderation/BackgroundReportSync";
import { getSiteIfNeeded, isAdminSelector } from "./features/auth/siteSlice";
import { instanceSelector, jwtSelector } from "./features/auth/authSelectors";
import { useOptimizedIonRouter } from "./helpers/useOptimizedIonRouter";
import { TabContext } from "./TabContext";

interface AuthProps {
  children: React.ReactNode;
}

export default function Auth({ children }: AuthProps) {
  const dispatch = useAppDispatch();
  const jwt = useAppSelector(jwtSelector);
  const selectedInstance = useAppSelector(instanceSelector);
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );

  const router = useOptimizedIonRouter();
  const { tabRef } = useContext(TabContext);
  const oldInstanceRef = useRef(selectedInstance);

  useEffect(() => {
    // On change, reset tab state in ionic router
    if (oldInstanceRef.current !== selectedInstance) {
      router.push(`/${tabRef?.current || "posts"}`, "none", "push");

      oldInstanceRef.current = selectedInstance;
    }

    dispatch(getSiteIfNeeded());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jwt, connectedInstance]);

  return (
    // Rebuild routing on instance change
    <React.Fragment key={connectedInstance ?? getDefaultServer()}>
      <AuthLocation />
      {connectedInstance ? children : undefined}
    </React.Fragment>
  );
}

/**
 * Separate component so that it doesn't rerender react component tree on location change
 */
function AuthLocation() {
  const location = useLocation();

  const dispatch = useAppDispatch();
  const presentToast = useAppToast();
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

  const shouldSyncMessages = useCallback(() => {
    return jwt && location.pathname.startsWith("/inbox/messages");
  }, [jwt, location]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const getInboxCountsAndErrorIfNeeded = useCallback(async () => {
    try {
      await dispatch(getInboxCounts());
    } catch (error) {
      if (
        isLemmyError(error, "not_logged_in") ||
        isLemmyError(error, "incorrect_login")
      ) {
        presentToast({
          message: "Logged out by Lemmy instance. Please try logging in again.",
          color: "warning",
          duration: 4_000,
        });
      }

      throw error;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useInterval(
    () => {
      if (!pageVisibility) return;
      if (!shouldSyncMessages()) return;

      dispatch(syncMessages());
    },
    shouldSyncMessages() ? 1_000 * 15 : null,
  );

  useInterval(() => {
    if (!pageVisibility) return;
    if (!jwt) return;

    getInboxCountsAndErrorIfNeeded();
  }, 1_000 * 60);

  useEffect(() => {
    if (!pageVisibility) return;

    getInboxCountsAndErrorIfNeeded();
  }, [pageVisibility, jwt, getInboxCountsAndErrorIfNeeded]);

  useEffect(() => {
    if (!pageVisibility) return;
    if (!shouldSyncMessages()) return;

    dispatch(syncMessages());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageVisibility]);

  return <>{hasModdedSubs && <BackgroundReportSync />}</>;
}
