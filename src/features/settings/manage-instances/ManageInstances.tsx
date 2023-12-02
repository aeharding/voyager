import { IonLabel, IonList, useIonAlert } from "@ionic/react";
import { InsetIonItem, ListHeader } from "../shared/formatting";
import { getCustomServers } from "../../../services/app";
import { getClient } from "../../../services/lemmy";
import useAppToast from "../../../helpers/useAppToast";
import { uniq, without } from "lodash";
import { useState } from "react";
import Instance from "./Instance";

interface ManageInstancesProps {
  editing: boolean;
}

export default function ManageInstances({ editing }: ManageInstancesProps) {
  const [instances, setInstances] = useState(getCustomServers());
  const [presentAlert] = useIonAlert();
  const presentToast = useAppToast();

  const validHostname = (customServer: string) => {
    try {
      return new URL(
        customServer.startsWith("https://")
          ? customServer
          : `https://${customServer}`,
      ).hostname;
    } catch (e) {
      return undefined;
    }
  };

  async function confirmInstance(instance: string) {
    if (instance) {
      const hostname = validHostname(instance);
      if (!hostname) {
        presentToast({
          message: `${instance} is not a valid server name. Please try again`,
          color: "danger",
          fullscreen: true,
        });

        return;
      }

      try {
        await getClient(hostname).getSite();
      } catch (error) {
        presentToast({
          message: `Problem connecting. Either ${hostname} is not a Lemmy server or it is down. Please try again`,
          color: "danger",
          fullscreen: true,
        });

        return false;
      }
    }

    return true;
  }

  function addInstance() {
    presentAlert({
      header: "Add custom instance",
      buttons: [
        {
          text: "OK",
          handler: async ({ instance }) => {
            if (!instance.trim()) return;

            if (await confirmInstance(instance)) {
              setInstances(uniq([...instances, instance.trim()]));
            }
          },
        },
        "Cancel",
      ],
      inputs: [
        {
          name: "instance",
          placeholder: "lemmy.world",
        },
      ],
    });
  }

  function removeInstance(domain: string) {
    setInstances(without(instances, domain));
  }

  function resetInstances() {
    setInstances(getCustomServers());
  }

  return (
    <>
      <ListHeader>
        <IonLabel>Instances</IonLabel>
      </ListHeader>
      <IonList inset>
        {instances.map((instance) => (
          <Instance
            key={instance}
            domain={instance}
            editing={editing}
            onRemove={removeInstance}
          />
        ))}
        <InsetIonItem onClick={addInstance}>
          <IonLabel color="primary">Add Instance</IonLabel>
        </InsetIonItem>
      </IonList>
      <IonList inset>
        <InsetIonItem onClick={resetInstances}>
          <IonLabel color="danger">Reset Instance List</IonLabel>
        </InsetIonItem>
      </IonList>
    </>
  );
}
