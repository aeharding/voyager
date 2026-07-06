import { IonToolbar } from "@ionic/react";

import AppHeader from "#/features/shared/AppHeader";
import { isTauri } from "#/helpers/device";
import { useAppSelector } from "#/store";

import styles from "./TwoColumnEmpty.module.css";

export default function TwoColumnEmpty() {
  const systemWindowFrame = useAppSelector(
    (state) => state.settings.appearance.general.systemWindowFrame,
  );

  return (
    <div className={styles.container}>
      {isTauri() && !systemWindowFrame && (
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
