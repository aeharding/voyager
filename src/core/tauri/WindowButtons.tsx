import { IonButton, IonButtons, IonIcon } from "@ionic/react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  closeOutline,
  copyOutline,
  removeOutline,
  squareOutline,
} from "ionicons/icons";

import { toggleMaximize, useWindowMaximized } from "./WindowChrome";

import styles from "./WindowButtons.module.css";

/**
 * Window management buttons (minimize/maximize/close) for the Tauri
 * desktop app, styled as regular toolbar buttons.
 *
 * Injected into the rightmost visible header by AppHeader.
 */
export default function WindowButtons() {
  const maximized = useWindowMaximized();

  return (
    <IonButtons slot="end">
      <IonButton
        aria-label="Minimize"
        onClick={() => getCurrentWindow().minimize()}
      >
        <IonIcon slot="icon-only" icon={removeOutline} />
      </IonButton>
      <IonButton
        aria-label={maximized ? "Restore" : "Maximize"}
        onClick={toggleMaximize}
      >
        <IonIcon
          slot="icon-only"
          className={styles.maximizeIcon}
          icon={maximized ? copyOutline : squareOutline}
        />
      </IonButton>
      <IonButton aria-label="Close" onClick={() => getCurrentWindow().close()}>
        <IonIcon slot="icon-only" icon={closeOutline} />
      </IonButton>
    </IonButtons>
  );
}
