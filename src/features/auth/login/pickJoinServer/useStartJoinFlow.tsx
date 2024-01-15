import { MutableRefObject } from "react";
import { useAppDispatch } from "../../../../store";
import { requestJoinSiteData } from "../join/joinSlice";
import Legal from "../join/Legal";
import Question from "../join/Question";
import Join from "../join/Join";
import { useIonAlert } from "@ionic/react";
import useAppToast from "../../../../helpers/useAppToast";
import { GetSiteResponse } from "lemmy-js-client";

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
        message: `Problem connecting to ${url}. Please try again later.`,
        position: "top",
        color: "danger",
      });

      throw error;
    }

    if (site?.site_view.local_site.registration_mode === "Closed") {
      presentAlert(`Registration closed for ${url}`);

      return;
    }

    ref.current?.closest("ion-nav")?.push(() => {
      if (site?.site_view.local_site.legal_information) return <Legal />;
      if (
        site?.site_view.local_site.application_question &&
        site?.site_view.local_site.registration_mode === "RequireApplication"
      )
        return <Question />;

      return <Join />;
    });
  };
}
