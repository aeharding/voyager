import { IonIcon } from "@ionic/react";
import { lockClosed } from "ionicons/icons";

import styles from "./Locked.module.css";

export default function Locked() {
  return (
    <div className={styles.container}>
      <IonIcon className={styles.lockIcon} icon={lockClosed} color="success" />
      <div className={styles.description}>
        <div>Post Locked</div>
        <aside>Moderators have turned off new comments.</aside>
      </div>
    </div>
  );
}
