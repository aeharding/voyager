import { IonToolbar } from "@ionic/react";

import AppHeader from "#/features/shared/AppHeader";
import { isTauri } from "#/helpers/device";

import styles from "./TwoColumnEmpty.module.css";

export default function TwoColumnEmpty() {
  return (
    <div className={styles.container}>
      {isTauri() && (
        <AppHeader className={styles.header}>
          {/* Window buttons injected by AppHeader, positioned
              identically to second column page headers */}
          <IonToolbar className={styles.toolbar} />
        </AppHeader>
      )}
      <img src="/logo.png" alt="" />
    </div>
  );
}
