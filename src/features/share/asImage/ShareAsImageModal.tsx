import {
  IonButton,
  IonButtons,
  IonIcon,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { close } from "ionicons/icons";
import { RefObject, useEffect, useState } from "react";
import { CommentView, PostView } from "threadiverse";

import AppHeader from "#/features/shared/AppHeader";

import ShareAsImage from "./ShareAsImage";

import sharedStyles from "#/features/shared/shared.module.css";
import styles from "./ShareAsImageModal.module.css";

export type ShareAsImageData =
  | {
      post: PostView;
    }
  | {
      post: PostView;
      comment: CommentView;
      comments: CommentView[];
    };

interface SelectTextProps {
  dataRef: RefObject<ShareAsImageData | null>;
  onDismiss: () => void;
}

export default function ShareAsImageModal({
  dataRef,
  onDismiss,
}: SelectTextProps) {
  const [data, setData] = useState<ShareAsImageData | null>(null);

  useEffect(() => {
    setData(dataRef.current);
  }, [dataRef]);

  return (
    <div className={styles.content}>
      {data && (
        <ShareAsImage
          data={data}
          header={
            <AppHeader className={styles.header}>
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
                <IonTitle>Preview</IonTitle>
              </IonToolbar>
            </AppHeader>
          }
        />
      )}
    </div>
  );
}
