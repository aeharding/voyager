import { Instance } from "lemmy-js-client";
import GenericSelectorModal from "./GenericSelectorModal";
import { useAppSelector } from "../../../store";

interface InstanceSelectorModalProps {
  onDismiss: (instance?: Instance) => void;
}

export default function InstanceSelectorModal(
  props: InstanceSelectorModalProps,
) {
  const instances = useAppSelector((state) => {
    if (typeof state.instances.knownInstances === "object")
      return state.instances.knownInstances.linked;
  });

  async function search(query: string) {
    if (!instances) return [];
    if (!query) return instances;

    return instances.filter((instance) =>
      instance.domain.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
    );
  }

  return (
    <GenericSelectorModal
      search={search}
      {...props}
      getIndex={(instance) => instance.id}
      getLabel={(instance) => instance.domain}
      itemSingular="Instance"
      itemPlural="Instances"
    />
  );
}
