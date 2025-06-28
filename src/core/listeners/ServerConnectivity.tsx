import { useIonAlert } from "@ionic/react";
import { sample, without } from "es-toolkit";
import {
  useEffect,
  experimental_useEffectEvent as useEffectEvent,
} from "react";

import { addGuestInstance } from "#/features/auth/authSlice";
import { setIgnoreInstanceOffline } from "#/features/auth/siteSlice";
import { defaultServersUntouched } from "#/services/app";
import { useAppDispatch, useAppSelector } from "#/store";

const DEAD_SERVERS = ["lemm.ee", "example.com"];

export default function ServerConnectivity() {
  const dispatch = useAppDispatch();
  const failedAttempt = useAppSelector((state) => state.site.failedAttempt);
  const ignoreInstanceOffline = useAppSelector(
    (state) => state.site.ignoreInstanceOffline,
  );
  const accountData = useAppSelector((state) => state.auth.accountData);
  const connectedInstance = useAppSelector(
    (state) => state.auth.connectedInstance,
  );
  const [presentAlert] = useIonAlert();
  const unsupportedSoftware = useAppSelector(
    (state) => state.site.unsupportedSoftware,
  );

  const showSwitchInstanceAlertIfNeeded = useEffectEvent(() => {
    if (ignoreInstanceOffline) return;

    // Only suggest switching if the instance is dead
    if (!DEAD_SERVERS.includes(connectedInstance)) return;

    // If custom voyager instance, don't suggest a different one
    if (!defaultServersUntouched()) return;

    // Power user - they know what they're doing
    if (accountData && accountData.accounts.length > 1) return;

    const candidate = sample(
      without(
        ["lemmy.world", "lemmy.zip", "sh.itjust.works"],
        connectedInstance,
      ),
    );

    presentAlert({
      header: `Failed to connect to ${connectedInstance}`,
      message: "Please try again later or try another instance.",
      buttons: [
        {
          text: `Switch to ${candidate}`,
          handler: () => {
            dispatch(setIgnoreInstanceOffline());
            dispatch(addGuestInstance(candidate));
          },
        },
        {
          text: "Cancel",
          handler: () => {
            dispatch(setIgnoreInstanceOffline());
          },
        },
      ],
    });
  });

  useEffect(() => {
    if (failedAttempt < 3) return;
    if (!navigator.onLine) return;

    showSwitchInstanceAlertIfNeeded();
  }, [failedAttempt]);

  useEffect(() => {
    if (!unsupportedSoftware) return;

    presentAlert({
      header: "Unsupported instance",
      message: `Voyager can't connect to ${connectedInstance} because it's not running a supported version of Lemmy or Piefed. Please try connecting to a different instance.`,
      buttons: [
        {
          text: "OK",
        },
      ],
    });
  }, [unsupportedSoftware, presentAlert, connectedInstance]);

  return null;
}
