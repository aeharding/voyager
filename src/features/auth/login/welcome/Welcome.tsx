import { IonContent, IonTitle, IonToolbar } from "@ionic/react";

import AppHeader from "#/features/shared/AppHeader";

import AndroidClose from "./AndroidClose";
import Buttons from "./Buttons";
import styles from "./Welcome.module.css";
import BaseSvg from "./assets/base.svg?react";

export default function Welcome() {
  return (
    <>
      <AppHeader>
        <IonToolbar>
          <IonTitle>Welcome</IonTitle>

          <AndroidClose />
        </IonToolbar>
      </AppHeader>
      <IonContent className={styles.content} fullscreen>
        <AppHeader collapse="condense">
          <IonToolbar color=" ">
            <IonTitle size="large">Welcome.</IonTitle>
          </IonToolbar>
        </AppHeader>

        <BaseSvg className={styles.baseSvg} />

        <Buttons />
      </IonContent>
    </>
  );
}
