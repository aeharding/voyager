import { useIonAlert } from "@ionic/react";
import { RefObject } from "react";
import { GetSiteResponse } from "threadiverse";

import {
  joinClientSelector,
  requestJoinSiteData,
} from "#/features/auth/login/join/joinSlice";
import Legal from "#/features/auth/login/join/Legal";
import useAppToast from "#/helpers/useAppToast";
import store, { useAppDispatch } from "#/store";

import { preflightRegistrationSupport } from "./registrationSupport";

export default function useStartJoinFlow(ref: RefObject<HTMLElement | null>) {
  const presentToast = useAppToast();
  const [presentAlert] = useIonAlert();
  const dispatch = useAppDispatch();

  return async function go(url: string) {
    let site: GetSiteResponse | undefined;

    try {
      site = await dispatch(requestJoinSiteData(url));
    } catch (error) {
      presentToast({
        message: `Problem connecting to ${url}. Please try again later.`,
        position: "top",
        color: "danger",
        fullscreen: true,
      });

      throw error;
    }

    const selectedState = store.getState();
    const client = joinClientSelector(selectedState);
    const isCurrentClient = () => {
      const currentState = store.getState();

      return (
        currentState.join.url === url &&
        joinClientSelector(currentState) === client
      );
    };

    if (!site || !client || !isCurrentClient()) return;

    const registrationSupport = await preflightRegistrationSupport(
      client,
      isCurrentClient,
    );

    if (registrationSupport === "stale") return;

    if (registrationSupport === "unsupported") {
      presentAlert(
        `Voyager doesn't support signups through this server right now, apologies!`,
      );

      return;
    }

    if (site?.site_view.local_site.registration_mode === "closed") {
      presentAlert(`Registration closed for ${url}`);

      return;
    }

    ref.current?.closest("ion-nav")?.push(() => <Legal />);
  };
}
