import {
  IonButton,
  IonIcon,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  ItemSlidingCustomEvent,
} from "@ionic/react";
import { removeCircle } from "ionicons/icons";
import { useRef } from "react";
import styled from "@emotion/styled";
import { InsetIonItem } from "../shared/formatting";

const RemoveIcon = styled(IonIcon)`
  position: relative;

  &:after {
    z-index: -1;
    content: "";
    position: absolute;
    inset: 5px;
    border-radius: 50%;
    background: white;
  }
`;

interface InstanceProps {
  editing: boolean;
  domain: string;
  onRemove: (instance: string) => void;
}

export default function Instance({ editing, domain, onRemove }: InstanceProps) {
  const slidingRef = useRef<ItemSlidingCustomEvent["target"]>(null);
  const removeInstance = () => onRemove(domain);

  return (
    <IonItemSliding ref={slidingRef}>
      <IonItemOptions side="end" onIonSwipe={removeInstance}>
        <IonItemOption color="danger" expandable onClick={removeInstance}>
          Remove
        </IonItemOption>
      </IonItemOptions>
      <InsetIonItem>
        {editing && (
          <IonButton
            color="none"
            slot="start"
            onClick={() => {
              slidingRef.current?.open("end");
            }}
          >
            <RemoveIcon icon={removeCircle} color="danger" slot="icon-only" />
          </IonButton>
        )}
        <IonLabel>{domain}</IonLabel>
      </InsetIonItem>
    </IonItemSliding>
  );
}
