import { IonButton, IonSpinner } from "@ionic/react";
import useInAppPurchase, { Product } from "./useInAppPurchase";
import styled from "@emotion/styled";
import { useState } from "react";
import useAppToast from "../../../helpers/useAppToast";
import { css } from "@emotion/react";

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
          "There was an error completing your payment. Please try again later.",
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
        message: "Payment successful. Thank you so much for your support! 💙",
        color: "success",
        duration: 5_000,
      });
    }
  }

  return (
    <Container>
      <div>{product.label}</div>
      <StyledIonButton onClick={tip} loading={loading}>
        <Contents hide={loading}>{product.price}</Contents>
        <HiddenIonSpinner visible={loading} />
      </StyledIonButton>
    </Container>
  );
}
