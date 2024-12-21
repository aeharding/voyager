import { IonIcon } from "@ionic/react";
import { megaphone } from "ionicons/icons";

import styles from "./AnnouncementIcon.module.css";

export default function AnnouncementIcon() {
  return <IonIcon icon={megaphone} className={styles.icon} />;
}
