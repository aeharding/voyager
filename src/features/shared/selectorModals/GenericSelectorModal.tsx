import { css } from "@emotion/react";
import styled from "@emotion/styled";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { close } from "ionicons/icons";
import { useCallback, useEffect, useState } from "react";
import { VList } from "virtua";

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

  const query = useCallback(
    async (q: string) => {
      setItems(await search(q));
    },
    [search],
  );

  useEffect(() => {
    query("");
  }, [query]);

  return (
    <IonPage>
      <IonHeader>
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
      </IonHeader>
      <IonContent>
        <StyledIonList
          css={css`
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
