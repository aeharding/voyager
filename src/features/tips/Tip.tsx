import { IonButton, IonLoading } from "@ionic/react";
import useInAppPurchase, { Product } from "./useInAppPurchase";
import styled from "@emotion/styled";
import { useState } from "react";
import useAppToast from "../../helpers/useAppToast";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
`;

interface TipProps {
  product: Product;
}

export default function Tip({ product }: TipProps) {
  const presentToast = useAppToast();
  const [loading, setLoading] = useState(false);
  const { purchase } = useInAppPurchase();

  async function tip() {
    setLoading(true);

    let error;

    try {
      error = await purchase(product);
    } catch (error) {
      presentToast({
        message:
          "There was an error completing your purchase. Please try again later.",
        color: "warning",
      });
      throw error;
    } finally {
      setLoading(false);
    }

    if (error) {
      if (error.code === CdvPurchase.ErrorCode.PAYMENT_CANCELLED) return;

      presentToast({
        message: error?.message || "Unknown error. Please try again later.",
        color: "warning",
      });
    } else {
      presentToast({
        message: "Purchase successful. Thank you so much for your support! 💙",
        color: "success",
        duration: 5_000,
      });
    }
  }

  return (
    <Container>
      <div>{product.label}</div>
      <IonButton onClick={tip}>{product.price}</IonButton>
      <IonLoading isOpen={loading} message="one sec!" />
    </Container>
  );
}
