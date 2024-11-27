import { IonButton, IonSpinner } from "@ionic/react";
import { Product } from "capacitor-tips";
import { useState } from "react";

import { cx } from "#/helpers/css";
import useAppToast from "#/helpers/useAppToast";

import useInAppPurchase from "./useInAppPurchase";

import styles from "./Tip.module.css";

interface TipProps {
  product: Product;
}

export default function Tip({ product }: TipProps) {
  const presentToast = useAppToast();
  const [loading, setLoading] = useState(false);
  const { purchase } = useInAppPurchase();

  async function tip() {
    setLoading(true);

    try {
      await purchase(product);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;

      if (err?.code === "cancelled") return; // cancelled

      presentToast({
        message:
          err?.message ??
          "There was an error completing your payment. Please try again later.",
        color: "warning",
      });
      throw error;
    } finally {
      setLoading(false);
    }

    presentToast({
      message: "Payment successful. Thank you so much for your support! 💙",
      color: "success",
      duration: 5_000,
    });
  }

  return (
    <div className={styles.container}>
      <div>{product.description}</div>
      <IonButton
        className={styles.button}
        onClick={tip}
        style={loading ? { pointerEvents: "none" } : undefined}
      >
        <span className={cx(styles.contents, loading && styles.hide)}>
          {product.priceString}
        </span>
        <IonSpinner
          className={cx(styles.hiddenSpinner, loading && styles.visible)}
        />
      </IonButton>
    </div>
  );
}
