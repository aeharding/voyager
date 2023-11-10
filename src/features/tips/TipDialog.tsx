import styled from "@emotion/styled";
import { IonIcon } from "@ionic/react";
import { close, heart } from "ionicons/icons";
import InAppProducts from "./inAppPurchase/InAppProducts";
import ExternalSponsorOptions from "./ExternalSponsorOptions";
import { isNative } from "../../helpers/device";

const Container = styled.div`
  margin: 36px auto;
  background: var(--ion-background-color);
  border-radius: 16px;
  max-width: 320px;

  position: relative;
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 16px;

  padding: 16px;
`;

const CloseButton = styled.button`
  border-radius: 50%;
  background: rgba(180, 180, 180, 0.2);

  appearance: none;
  padding: 5px;
  color: var(--ion-color-medium);

  display: flex;

  position: absolute;
  right: 8px;
  top: 8px;

  font-size: 1.3em;
`;

const Heart = styled.div`
  font-size: 3em;
  margin-top: -46px;
  background: color(display-p3 1 0 0);
  border-radius: 50%;
  padding: 8px;

  display: flex;
`;

const Title = styled.div`
  font-size: 1.4em;
`;

const Description = styled.div`
  line-height: 1.5;
  text-align: center;
`;

const Tips = styled.div`
  flex: 1;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  gap: 16px;

  width: 100%;
  min-height: 150px;
`;

interface TipProps {
  onDismiss: (data?: string, role?: string) => void;
}

export default function TipDialog({ onDismiss }: TipProps) {
  return (
    <Container>
      <CloseButton color="medium" onClick={() => onDismiss()}>
        <IonIcon icon={close} />
      </CloseButton>

      <Heart>
        <IonIcon icon={heart} />
      </Heart>
      <Title>Support Voyager</Title>
      <Description>
        Voyager is completely free, forever. Your support means a lot!
      </Description>
      <Tips>
        {BUILD_FOSS_ONLY || !isNative() ? (
          <ExternalSponsorOptions />
        ) : (
          <InAppProducts />
        )}
      </Tips>
    </Container>
  );
}
