import {
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  useIonAlert,
} from "@ionic/react";
import { uniq, without } from "es-toolkit";
import { close } from "ionicons/icons";

import { ListHeader } from "#/features/settings/shared/formatting";
import { RemoveItemButton } from "#/features/shared/ListEditor";
import { parseUrl } from "#/helpers/url";
import useAppToast from "#/helpers/useAppToast";
import { useAppDispatch, useAppSelector } from "#/store";

import { updateFilteredWebsites } from "../settingsSlice";

export default function FilteredWebsites() {
  const [presentAlert] = useIonAlert();
  const presentToast = useAppToast();
  const dispatch = useAppDispatch();
  const filteredWebsites = useAppSelector(
    (state) => state.settings.blocks.websites,
  );

  async function remove(website: string) {
    dispatch(updateFilteredWebsites(without(filteredWebsites, website)));
  }

  async function add() {
    presentAlert({
      message: "Add Filtered Website",
      buttons: [
        {
          text: "OK",
          handler: ({ website }) => {
            const cleanedWebsite = website.trim().toLowerCase();

            if (!cleanedWebsite) return;

            const hasProtocol = /^https?:\/\//.test(cleanedWebsite);
            const host = parseUrl(
              `${hasProtocol ? "" : "https://"}${cleanedWebsite}`,
            )?.host;

            if (!host || !host.includes(".")) {
              presentToast({
                message: "Invalid website",
                color: "danger",
                icon: close,
              });
              return false;
            }

            dispatch(updateFilteredWebsites(uniq([...filteredWebsites, host])));
          },
        },
        "Cancel",
      ],
      inputs: [
        {
          placeholder: "example.org",
          name: "website",
          type: "url",
        },
      ],
    });
  }

  return (
    <>
      <ListHeader>
        <IonLabel>Filtered Websites</IonLabel>
      </ListHeader>
      <IonList inset>
        {filteredWebsites.map((website) => (
          <IonItemSliding key={website}>
            <IonItemOptions side="end" onIonSwipe={() => remove(website)}>
              <IonItemOption
                color="danger"
                expandable
                onClick={() => remove(website)}
              >
                Unfilter
              </IonItemOption>
            </IonItemOptions>
            <IonItem>
              <RemoveItemButton />
              <IonLabel>{website}</IonLabel>
            </IonItem>
          </IonItemSliding>
        ))}

        <IonItemSliding>
          <IonItem onClick={add} button detail={false}>
            <IonLabel color="primary">Add Website</IonLabel>
          </IonItem>
        </IonItemSliding>
      </IonList>
    </>
  );
}
