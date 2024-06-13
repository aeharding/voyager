import { MutableRefObject } from "react";
import { useAppDispatch } from "../../../../store";
import { requestJoinSiteData } from "../join/joinSlice";
import Legal from "../join/Legal";
import { useIonAlert } from "@ionic/react";
import useAppToast from "../../../../helpers/useAppToast";
import { GetSiteResponse } from "lemmy-js-client";
import { presentErrorMessage } from "../../../../helpers/error";

export default function useStartJoinFlow(
  ref: MutableRefObject<HTMLElement | null>,
) {
  const presentToast = useAppToast();
  const [presentAlert] = useIonAlert();
  const dispatch = useAppDispatch();

  return async function go(url: string) {
    let site: GetSiteResponse | undefined;

    try {
      site = await dispatch(requestJoinSiteData(url));
    } catch (error) {
      presentToast({
        message: presentErrorMessage(`Problem connecting to ${url}`, error),
        position: "top",
        color: "danger",
        fullscreen: true,
      });

      throw error;
    }

    if (site?.site_view.local_site.registration_mode === "Closed") {
      presentAlert(`Registration closed for ${url}`);

      return;
    }

    ref.current?.closest("ion-nav")?.push(() => <Legal />);
  };
}
