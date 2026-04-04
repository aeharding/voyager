import { IonAlert } from "@ionic/react";
import { useDocumentVisibility, useInterval } from "@mantine/hooks";
import React, {
  use,
  useCallback,
  useEffect,
  useEffectEvent,
  useState,
} from "react";
import { useLocation } from "react-router";
import { PiefedResponseError } from "threadiverse";

import {
  activeAccountSelector,
  instanceSelector,
  jwtSelector,
} from "#/features/auth/authSelectors";
import {
  logoutAccount,
  updateConnectedInstance,
} from "#/features/auth/authSlice";
import { SharedDialogContext } from "#/features/auth/SharedDialogContext";
import { getSiteIfNeeded, isAdminSelector } from "#/features/auth/siteSlice";
import {
  getInboxCounts as _getInboxCounts,
  syncMessages,
} from "#/features/inbox/inboxSlice";
import BackgroundReportSync from "#/features/moderation/BackgroundReportSync";
import { isLemmyError } from "#/helpers/lemmyErrors";
import { getDefaultServer } from "#/services/app";
import store, { useAppDispatch, useAppSelector } from "#/store";

export default function Auth({ children }: React.PropsWithChildren) {
  const dispatch = useAppDispatch();
  const activeAccount = useAppSelector(activeAccountSelector);
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );

  useEffect(() => {
    dispatch(getSiteIfNeeded());
  }, [dispatch, activeAccount, connectedInstance]);

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

  const { presentLoginIfNeeded } = use(SharedDialogContext);
  const [isReauthNeeded, setIsReauthNeeded] = useState(false);
  const hasModdedSubs = useAppSelector(
    (state) =>
      !!state.site.response?.my_user?.moderates.length ||
      !!isAdminSelector(state),
  );

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
  }, [dispatch, connectedInstance, location.pathname, selectedInstance]);

  const getInboxCounts = useCallback(async () => {
    try {
      await dispatch(_getInboxCounts());
    } catch (error) {
      if (isLemmyError(error, "incorrect_login")) setIsReauthNeeded(true);
      else if (
        error instanceof PiefedResponseError &&
        (error.status === 400 || error.status === 401)
      )
        setIsReauthNeeded(true);

      throw error;
    }
  }, [dispatch]);

  const shouldSyncMessages = useCallback(() => {
    return jwt && location.pathname.startsWith("/inbox/messages");
  }, [jwt, location]);

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
      if (documentState === "hidden") return;
      if (!jwt) return;

      getInboxCounts();
    },
    1_000 * 60,
    { autoInvoke: true },
  );

  const [oldDocumentState, setOldDocumentState] = useState<
    DocumentVisibilityState | undefined
  >(undefined);
  const [oldJwt, setOldJwt] = useState<string | undefined>(undefined);

  if (oldDocumentState !== documentState || oldJwt !== jwt) {
    setOldDocumentState(documentState);
    setOldJwt(jwt);

    if (documentState === "visible") getInboxCounts();
  }

  const shouldSyncMessagesEvent = useEffectEvent(shouldSyncMessages);

  useEffect(() => {
    if (documentState === "hidden") return;
    if (!shouldSyncMessagesEvent()) return;

    dispatch(syncMessages());
  }, [dispatch, documentState]);

  return (
    <>
      {hasModdedSubs && <BackgroundReportSync />}
      <IonAlert
        isOpen={isReauthNeeded}
        onDidDismiss={() => setIsReauthNeeded(false)}
        header="Login Session Expired"
        message="Your login session is no longer valid. Please log in again."
        backdropDismiss={false}
        buttons={[
          {
            text: "Login",
            handler: () => {
              const activeAccount = activeAccountSelector(store.getState());
              if (!activeAccount) return;

              presentLoginIfNeeded(activeAccount.handle);
            },
          },
          {
            text: "Logout",
            handler: () => {
              const activeAccount = activeAccountSelector(store.getState());
              if (!activeAccount) return;

              dispatch(logoutAccount(activeAccount.handle));
            },
            role: "destructive",
          },
        ]}
      />
    </>
  );
}
