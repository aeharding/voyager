import { IonIcon } from "@ionic/react";
import { heart } from "ionicons/icons";

import { isNative } from "#/helpers/device";
import FloatingDialog from "#/helpers/FloatingDialog";

import ExternalSponsorOptions from "./ExternalSponsorOptions";
import InAppProducts from "./inAppPurchase/InAppProducts";

import styles from "./TipDialog.module.css";

interface TipProps {
  onDismiss: (data?: string, role?: string) => void;
}

export default function TipDialog({ onDismiss }: TipProps) {
  function renderTip() {
    if (import.meta.env.BUILD_FOSS_ONLY || !isNative()) {
      return <ExternalSponsorOptions />;
    }

    return <InAppProducts />;
  }

  return (
    <FloatingDialog onDismiss={onDismiss}>
      <div className={styles.heart}>
        <IonIcon icon={heart} />
      </div>
      <div className={styles.title}>Support Voyager</div>
      <div className={styles.description}>
        Voyager is completely free, forever.
        <br />
        Your support means a lot!
      </div>
      <div className={styles.tips}>{renderTip()}</div>
    </FloatingDialog>
  );
}
