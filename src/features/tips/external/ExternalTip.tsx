import { IonButton } from "@ionic/react";

import { useOnExternalPaymentLinkClickHandler } from "../useOnExternalPaymentLinkClickHandler";
import { IExternalTip } from "./ExternalTips";

import styles from "../Tip.module.css";

interface ExternalTipProps {
  tip: IExternalTip;
}

export default function ExternalTip({ tip }: ExternalTipProps) {
  const onExternalPaymentLinkClickHandler =
    useOnExternalPaymentLinkClickHandler();

  return (
    <div className={styles.container}>
      <div>{tip.title}</div>
      <IonButton
        className={styles.button}
        onClick={onExternalPaymentLinkClickHandler}
        href={tip.link}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className={styles.contents}>${tip.amount}</span>
      </IonButton>
    </div>
  );
}
