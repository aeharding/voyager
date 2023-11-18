import { IonButton, IonSpinner } from "@ionic/react";
import useInAppPurchase from "./useInAppPurchase";
import styled from "@emotion/styled";
import { useState } from "react";
import useAppToast from "../../../helpers/useAppToast";
import { css } from "@emotion/react";
import { PurchasesStoreProduct } from "@revenuecat/purchases-capacitor";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
`;

const transition = css`
  transition: opacity 250ms linear;
`;

const StyledIonButton = styled(IonButton)<{ loading: boolean }>`
  position: relative;

  ${({ loading }) =>
    loading &&
    css`
      pointer-events: none;
    `}
`;

const Contents = styled.span<{ hide: boolean }>`
  opacity: 1;

  ${({ hide }) =>
    hide &&
    css`
      opacity: 0;
    `}

  ${transition}
`;

const HiddenIonSpinner = styled(IonSpinner)<{ visible: boolean }>`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  opacity: 0;

  ${({ visible }) =>
    visible &&
    css`
      opacity: 1;
    `}

  ${transition}
`;

interface TipProps {
  product: PurchasesStoreProduct;
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

      if (err?.code === "1") return; // cancelled

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
    <Container>
      <div>{product.description}</div>
      <StyledIonButton onClick={tip} loading={loading}>
        <Contents hide={loading}>{product.priceString}</Contents>
        <HiddenIonSpinner visible={loading} />
      </StyledIonButton>
    </Container>
  );
}
