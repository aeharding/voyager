import { Instance } from "lemmy-js-client";
import GenericSelectorModal from "./GenericSelectorModal";
import { useEffect, useState } from "react";
import useClient from "../../../helpers/useClient";
import { IonLoading } from "@ionic/react";
import useAppToast from "../../../helpers/useAppToast";

interface InstanceSelectorModalProps {
  onDismiss: (instance?: Instance) => void;
}

export default function InstanceSelectorModal(
  props: InstanceSelectorModalProps,
) {
  const client = useClient();
  const [loading, setLoading] = useState(false);

  // Don't use instances from state because it may be stale
  const [instances, setInstances] = useState<Instance[]>([]);

  const presentToast = useAppToast();

  useEffect(() => {
    getInstances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function getInstances() {
    let instances;

    setLoading(true);

    try {
      instances = await client.getFederatedInstances();
    } catch (error) {
      presentToast({
        message: "Failed to load instance list",
        color: "danger",
      });
      props.onDismiss();

      throw error;
    } finally {
      setLoading(false);
    }

    setInstances(instances.federated_instances?.linked ?? []);
  }

  async function search(query: string) {
    if (!instances) return [];
    if (!query) return instances;
    const q = query.toLocaleLowerCase();

    return instances.filter((instance) => instance.domain.includes(q));
  }

  return (
    <>
      <GenericSelectorModal
        search={search}
        {...props}
        getIndex={(instance) => instance.id}
        getLabel={(instance) => instance.domain}
        itemSingular="Instance"
        itemPlural="Instances"
      />

      <IonLoading isOpen={loading} />
    </>
  );
}
