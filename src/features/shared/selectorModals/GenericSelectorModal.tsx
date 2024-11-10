import {
  IonButton,
  IonButtons,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { css } from "@linaria/core";
import { styled } from "@linaria/react";
import { close } from "ionicons/icons";
import {
  useEffect,
  experimental_useEffectEvent as useEffectEvent,
  useState,
} from "react";
import { VList } from "virtua";

import AppHeader from "../AppHeader";

export const TransparentIonToolbar = styled(IonToolbar)`
  --background: none;
  --border-width: 0 !important;
`;

export const CloseButton = styled(IonButton)`
  border-radius: 50%;
  background: rgba(180, 180, 180, 0.2);
`;

const StyledIonSearchbar = styled(IonSearchbar)`
  padding-top: 0;
  padding-bottom: 0;
  height: 40px;
`;

const StyledIonList = styled(IonList)`
  --ion-item-background: none;
`;

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
    <IonPage>
      <AppHeader>
        <TransparentIonToolbar>
          <IonButtons slot="end">
            <CloseButton color="medium" onClick={() => onDismiss()}>
              <IonIcon icon={close} />
            </CloseButton>
          </IonButtons>
          <IonTitle>{itemPlural}</IonTitle>
        </TransparentIonToolbar>
        <StyledIonSearchbar
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
        <StyledIonList
          className={css`
            height: 100%;
          `}
        >
          <VList count={items.length}>
            {(i) => {
              const item = items[i]!;

              return (
                <IonItem key={getIndex(item)} onClick={() => onDismiss(item)}>
                  <IonLabel>{getLabel(item)}</IonLabel>
                </IonItem>
              );
            }}
          </VList>
        </StyledIonList>
      </IonContent>
    </IonPage>
  );
}
