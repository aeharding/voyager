import { useIonAlert } from "@ionic/react";
import { useEffect, useRef } from "react";
import { useAppSelector } from "../store";
import { useBuildGeneralBrowseLink } from "../helpers/routes";
import { compare } from "compare-versions";
import { getItemActorName } from "../helpers/lemmy";

const ANNOUNCEMENT_LINK = "https://lemmy.world/post/12479493";
const MINIMUM_REQUIRED_VERSION = "0.19.0";

export default function OldInstanceWarning() {
  const lastSiteActorIdRef = useRef("");
  const [presentAlert] = useIonAlert();
  const site = useAppSelector((state) => state.site.response);
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  useEffect(() => {
    if (!site) return;
    if (lastSiteActorIdRef.current === site.site_view.site.actor_id) return;
    lastSiteActorIdRef.current = site.site_view.site.actor_id;
    if (compare(MINIMUM_REQUIRED_VERSION, site.version, "<=")) return;

    presentAlert({
      header: `⚠️ ${getItemActorName(site.site_view.site)} is running outdated software`,
      message: `Voyager is dropping support for Lemmy 0.18 as of March 18, 2024. Please ask your instance administrator to upgrade as soon as possible, or use another instance.`,
      buttons: [
        "OK",
        {
          text: "Learn More",
          handler: async () => {
            window.open(ANNOUNCEMENT_LINK, "_blank", "noreferrer");
          },
        },
      ],
    });
  }, [site, presentAlert, buildGeneralBrowseLink]);

  return null;
}
