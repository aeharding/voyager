import {
  IonButton,
  IonButtons,
  IonIcon,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { close } from "ionicons/icons";
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
  data: ShareAsImageData | null;
  onDismiss: () => void;
}

export default function ShareAsImageModal({
  data,
  onDismiss,
}: SelectTextProps) {
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
