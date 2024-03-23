import { IonIcon, IonLabel, IonSpinner } from "@ionic/react";
import { styled } from "@linaria/react";
import { chevronDown } from "ionicons/icons";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100px;
  font-size: 0.875em;
  align-items: center;
  justify-content: center;
  color: var(--ion-color-medium);
`;

interface FeedLoadMoreFailedProps {
  fetchMore: () => void;
  loading: boolean;
  page: number;
}

export default function FetchMore({
  fetchMore,
  loading,
  page,
}: FeedLoadMoreFailedProps) {
  return (
    <Container onClick={() => fetchMore()}>
      {!loading ? (
        <IonLabel color="primary">
          Load Page {page + 1} <IonIcon icon={chevronDown} />
        </IonLabel>
      ) : (
        <IonSpinner />
      )}
    </Container>
  );
}
