import { IonIcon, IonLabel, IonSpinner } from "@ionic/react";
import { chevronDown } from "ionicons/icons";

import styles from "./FetchMore.module.css";

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
    <div onClick={() => fetchMore()} className={styles.container}>
      {!loading ? (
        <IonLabel color="primary">
          Load Page {page + 1} <IonIcon icon={chevronDown} />
        </IonLabel>
      ) : (
        <IonSpinner />
      )}
    </div>
  );
}
