import { IonIcon } from "@ionic/react";
import { styled } from "@linaria/react";
import { heart } from "ionicons/icons";

import FloatingDialog from "#/helpers/FloatingDialog";
import { isNative } from "#/helpers/device";

import ExternalSponsorOptions from "./ExternalSponsorOptions";
import InAppProducts from "./inAppPurchase/InAppProducts";

const Heart = styled.div`
  font-size: 3em;
  margin-top: -46px;

  border-radius: 50%;
  padding: 8px;

  display: flex;

  background: color(display-p3 1 0 0);
  color: white;
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
    <FloatingDialog onDismiss={onDismiss}>
      <Heart>
        <IonIcon icon={heart} />
      </Heart>
      <Title>Support Voyager</Title>
      <Description>
        Voyager is completely free, forever.
        <br />
        Your support means a lot!
      </Description>
      <Tips>
        {BUILD_FOSS_ONLY || !isNative() ? (
          <ExternalSponsorOptions />
        ) : (
          <InAppProducts />
        )}
      </Tips>
    </FloatingDialog>
  );
}
