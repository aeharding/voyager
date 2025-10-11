import {
  IonButton,
  IonButtons,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { close } from "ionicons/icons";
import { useEffect, useEffectEvent, useState } from "react";
import { VList } from "virtua";

import { AppPage } from "#/helpers/AppPage";

import AppHeader from "../AppHeader";

import sharedStyles from "#/features/shared/shared.module.css";
import styles from "./GenericSelectorModal.module.css";

interface GenericSelectorModalProps<I> {
  search: (query: string) => Promise<I[]>;
  onDismiss: (item?: I) => void;
  getIndex: (item: I) => number;
  getLabel: (item: I) => string;
  itemSingular: string;
  itemPlural: string;
}

export default function GenericSelectorModal<I>({
  onDismiss,
  search,
  getIndex,
  getLabel,
  itemSingular,
  itemPlural,
}: GenericSelectorModalProps<I>) {
  const [items, setItems] = useState<I[]>([]);

  async function query(q: string) {
    setItems(await search(q));
  }

  const queryEvent = useEffectEvent(query);

  useEffect(() => {
    queryEvent("");
  }, []);

  return (
    <AppPage>
      <AppHeader>
        <IonToolbar className={sharedStyles.transparentIonToolbar}>
          <IonButtons slot="end">
            <IonButton
              className={sharedStyles.closeButton}
              color="medium"
              onClick={() => onDismiss()}
            >
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
          <IonTitle>{itemPlural}</IonTitle>
        </IonToolbar>
        <IonSearchbar
          className={styles.searchbar}
          placeholder={`${itemSingular} name`}
          debounce={500}
          enterkeyhint="go"
          onIonInput={(e) => {
            query(e.detail.value ?? "");
          }}
          autoFocus
        />
      </AppHeader>
      <IonContent>
        <IonList className={styles.list}>
          <VList data={items}>
            {(item) => {
              return (
                <IonItem key={getIndex(item)} onClick={() => onDismiss(item)}>
                  <IonLabel>{getLabel(item)}</IonLabel>
                </IonItem>
              );
            }}
          </VList>
        </IonList>
      </IonContent>
    </AppPage>
  );
}
