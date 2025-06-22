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

    if (
      site &&
      (await joinClientSelector(store.getState())?.getMode()) === "piefed"
    ) {
      presentAlert(
        `Voyager doesn't support signups via Piefed right now, apologies!`,
      );

      return;
    }

    if (site?.site_view.local_site.registration_mode === "Closed") {
      presentAlert(`Registration closed for ${url}`);

      return;
    }

    ref.current?.closest("ion-nav")?.push(() => <Legal />);
  };
}
