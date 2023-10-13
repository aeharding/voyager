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
import { CommunityView } from "lemmy-js-client";
import { useState } from "react";
import useClient from "../../helpers/useClient";
import { getHandle } from "../../helpers/lemmy";

const TransparentIonToolbar = styled(IonToolbar)`
  --background: none;
  --border-width: 0 !important;
`;

const CloseButton = styled(IonButton)`
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

interface CommunitySelectorModalProps {
  onDismiss: (community?: CommunityView) => void;
}

export default function CommunitySelectorModal({
  onDismiss,
}: CommunitySelectorModalProps) {
  const [communities, setCommunities] = useState<CommunityView[]>([]);
  const client = useClient();

  async function search(query: string) {
    const result = await client.search({
      q: query,
      type_: "Communities",
      sort: "TopAll",
    });

    setCommunities(result.communities);
  }

  return (
    <IonPage>
      <IonHeader>
        <TransparentIonToolbar>
          <IonButtons slot="end">
            <CloseButton color="medium" onClick={() => onDismiss()}>
              <IonIcon icon={close} />
            </CloseButton>
          </IonButtons>
          <IonTitle>Communities</IonTitle>
        </TransparentIonToolbar>
        <StyledIonSearchbar
          placeholder="Community name"
          debounce={500}
          enterkeyhint="go"
          onIonInput={(e) => search(e.detail.value ?? "")}
          autoFocus
        />
      </IonHeader>
      <IonContent>
        <StyledIonList>
          {communities.map((community) => (
            <IonItem
              key={community.community.id}
              onClick={() => onDismiss(community)}
            >
              <IonLabel>{getHandle(community.community)}</IonLabel>
            </IonItem>
          ))}
        </StyledIonList>
      </IonContent>
    </IonPage>
  );
}
