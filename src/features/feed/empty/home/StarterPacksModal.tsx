import {
  IonButton,
  IonButtons,
  IonContent,
  IonIcon,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { arrowBackSharp, send } from "ionicons/icons";
import { useRef, useState } from "react";

import AppHeader from "#/features/shared/AppHeader";
import { isIosTheme } from "#/helpers/device";

import BulkSubscriber, { BulkSubscriberHandle } from "./BulkSubscriber";
import Pack from "./Pack";
import starterPackData from "./starterPackData";

export interface PackType {
  title: string;
  description: string;
  icon: string;
  communities: string[];
}

interface StarterPacksModalProps {
  onDismiss: (data?: string, role?: string) => void;
}

export default function StarterPacksModal({
  onDismiss,
}: StarterPacksModalProps) {
  const [selectedPacks, setSelectedPacks] = useState<PackType[]>([]);
  const bulkSubscriberRef = useRef<BulkSubscriberHandle>(undefined);

  function onSelect(select: boolean, pack: PackType) {
    if (select) {
      setSelectedPacks([...selectedPacks, pack]);
    } else {
      setSelectedPacks(selectedPacks.filter((p) => p !== pack));
    }
  }

  function onSubmit() {
    bulkSubscriberRef.current?.submit(selectedPacks);
  }

  return (
    <IonPage>
      <AppHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => onDismiss()}>
              {isIosTheme() ? (
                "Cancel"
              ) : (
                <IonIcon icon={arrowBackSharp} slot="icon-only" />
              )}
            </IonButton>
          </IonButtons>

          <IonButtons slot="end">
            <IonButton strong type="submit" onClick={onSubmit}>
              {isIosTheme() ? (
                "Submit"
              ) : (
                <IonIcon icon={send} slot="icon-only" />
              )}
            </IonButton>
          </IonButtons>
          <IonTitle>Starter Packs</IonTitle>
        </IonToolbar>
      </AppHeader>
      <IonContent>
        <BulkSubscriber ref={bulkSubscriberRef} onDismiss={onDismiss} />
        <IonList>
          {starterPackData.map((pack) => (
            <Pack key={pack.title} pack={pack} onSelect={onSelect} />
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
}
