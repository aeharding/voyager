import { IonText, IonTitle } from "@ionic/react";

import styles from "./MultilineTitle.module.css";

interface MultilineTitleProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "className"> {
  subheader?: string;
}

export default function MultilineTitle({
  subheader,
  children,
  ...props
}: MultilineTitleProps) {
  return (
    <IonTitle>
      <div className={styles.multilineTitle}>
        <div {...props} className={styles.titleContainer}>
          <IonText>{children}</IonText>
          <div>
            <IonText color="medium" className={styles.subheaderText}>
              {subheader}
            </IonText>
          </div>
        </div>
      </div>
    </IonTitle>
  );
}
