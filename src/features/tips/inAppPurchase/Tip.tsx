import { styled } from "@linaria/react";
import { css } from "@linaria/core";
import { IonButton, IonSpinner } from "@ionic/react";
import useInAppPurchase from "./useInAppPurchase";
import { useState } from "react";
import useAppToast from "../../../helpers/useAppToast";
import { Product } from "capacitor-tips";

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
`;

const transitionStyle = `
  transition: opacity 250ms linear;
`;

const StyledIonButton = styled(IonButton)`
  position: relative;
`;

const Contents = styled.span`
  opacity: 1;

  ${transitionStyle}
`;

const hideCss = css`
  opacity: 0;
`;

const HiddenIonSpinner = styled(IonSpinner)`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  opacity: 0;

  ${transitionStyle}
`;

const visibleCss = css`
  opacity: 1;
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
    <Container>
      <div>{product.description}</div>
      <StyledIonButton
        onClick={tip}
        style={loading ? { pointerEvents: "none" } : undefined}
      >
        <Contents className={loading ? hideCss : undefined}>
          {product.priceString}
        </Contents>
        <HiddenIonSpinner className={loading ? visibleCss : undefined} />
      </StyledIonButton>
    </Container>
  );
}
