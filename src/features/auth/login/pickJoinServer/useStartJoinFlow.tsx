import { MutableRefObject } from "react";
import { useAppDispatch } from "../../../../store";
import { requestJoinSiteData } from "../join/joinSlice";
import Legal from "../join/Legal";
import Question from "../join/Question";
import Join from "../join/Join";
import { useIonAlert } from "@ionic/react";

export default function useStartJoinFlow(
  ref: MutableRefObject<HTMLElement | null>,
) {
  const [presentAlert] = useIonAlert();
  const dispatch = useAppDispatch();

  return async function go(url: string) {
    const site = await dispatch(requestJoinSiteData(url));

    if (site?.site_view.local_site.registration_mode === "Closed") {
      presentAlert(`Registration closed for ${url}`);

      return;
    }

    ref.current?.closest("ion-nav")?.push(() => {
      if (site?.site_view.local_site.legal_information) return <Legal />;
      if (site?.site_view.local_site.application_question) return <Question />;
      return <Join />;
    });
  };
}
