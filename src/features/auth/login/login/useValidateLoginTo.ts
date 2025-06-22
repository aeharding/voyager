import { useIonAlert } from "@ionic/react";
import { GetSiteResponse, UnsupportedSoftwareError } from "threadiverse";

import useAppToast from "#/helpers/useAppToast";
import { getClient } from "#/services/client";

export default function useValidateLoginTo() {
  const presentToast = useAppToast();
  const [presentAlert] = useIonAlert();

  return async function validateLoginTo(
    potentialServer: string,
    go: (site: GetSiteResponse) => void,
  ) {
    let site: GetSiteResponse;
    const client = getClient(potentialServer);

    try {
      site = await client.getSite();
    } catch (error) {
      presentToast({
        message: `Problem connecting to ${potentialServer}. Please try again`,
        color: "danger",
        fullscreen: true,
      });

      if (error instanceof UnsupportedSoftwareError) {
        presentToast({
          message: error.message,
          color: "danger",
          fullscreen: true,
          duration: 6_000,
        });

        return;
      }

      throw error;
    }

    if (client.software.name === "piefed") {
      presentAlert({
        header: "⚠️ Piefed support is experimental",
        message:
          "Mind the edge; no safety rails installed. Piefed support is EXPERIMENTAL in Voyager. Don't expect things to work right, and compatibility may break at any time.",
        buttons: [
          {
            text: "Cancel",
            role: "cancel",
          },
          {
            text: "I understand",
            handler: () => go(site),
          },
        ],
      });
      return;
    }

    go(site);
  };
}
