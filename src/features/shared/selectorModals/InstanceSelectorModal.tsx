import { IonLoading } from "@ionic/react";
import { useEffect, useEffectEvent, useState } from "react";
import { Instance } from "threadiverse";

import useAppToast from "#/helpers/useAppToast";
import useClient from "#/helpers/useClient";

import GenericSelectorModal from "./GenericSelectorModal";

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

  const getInstancesEvent = useEffectEvent(async (signal: AbortSignal) => {
    let instances;

    setLoading(true);

    try {
      instances = await client.getFederatedInstances({ signal });
    } catch (error) {
      if (signal.aborted) return;

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
  });

  useEffect(() => {
    const abortController = new AbortController();

    // See https://react.dev/learn/you-might-not-need-an-effect#fetching-data
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getInstancesEvent(abortController.signal);

    return () => abortController.abort();
  }, []);

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
