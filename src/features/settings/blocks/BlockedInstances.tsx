import {
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonLoading,
  useIonModal,
} from "@ionic/react";
import { InsetIonItem } from "../../../routes/pages/profile/ProfileFeedItemsPage";
import { useAppDispatch, useAppSelector } from "../../../store";
import { useContext, useState } from "react";
import { Instance, InstanceBlockView } from "lemmy-js-client";
import { ListHeader } from "../shared/formatting";
import { blockInstance } from "../../auth/siteSlice";
import InstanceSelectorModal from "../../shared/selectorModals/InstanceSelectorModal";
import { PageContext } from "../../auth/PageContext";

export default function BlockedInstances() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const { pageRef } = useContext(PageContext);
  const [presentInstanceSelectorModal, onDismiss] = useIonModal(
    InstanceSelectorModal,
    {
      onDismiss: (instance?: Instance) => {
        if (instance) {
          dispatch(blockInstance(true, instance.id));
        }

        onDismiss(instance);
      },
      pageRef,
    },
  );

  const instances = useAppSelector(
    (state) => state.site.response?.my_user?.instance_blocks,
  );

  const sortedInstances = instances
    ?.slice()
    .sort((a, b) => a.instance.domain.localeCompare(b.instance.domain));

  async function remove(instanceBlock: InstanceBlockView) {
    setLoading(true);

    try {
      await dispatch(blockInstance(false, instanceBlock.instance.id));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ListHeader>
        <IonLabel>Blocked Instances</IonLabel>
      </ListHeader>

      <IonList inset>
        {sortedInstances?.map((instanceBlock) => (
          <IonItemSliding key={instanceBlock.instance.id}>
            <IonItemOptions side="end" onIonSwipe={() => remove(instanceBlock)}>
              <IonItemOption
                color="danger"
                expandable
                onClick={() => remove(instanceBlock)}
              >
                Unblock
              </IonItemOption>
            </IonItemOptions>
            <InsetIonItem>
              <IonLabel>{instanceBlock.instance.domain}</IonLabel>
            </InsetIonItem>
          </IonItemSliding>
        ))}

        <InsetIonItem
          onClick={() =>
            presentInstanceSelectorModal({
              cssClass: "small",
            })
          }
        >
          <IonLabel color="primary">Add Instance</IonLabel>
        </InsetIonItem>
      </IonList>

      <IonLoading isOpen={loading} />
    </>
  );
}
