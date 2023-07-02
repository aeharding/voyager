import React from "react";
import { IonFab, IonFabButton, IonIcon } from "@ionic/react";
import { chevronDownOutline, chevronUpOutline } from "ionicons/icons";

interface ScrollToTopFabProps {
  onClick: () => void;
  activated: boolean;
}

const ScrollToTopFab: React.FC<ScrollToTopFabProps> = ({
  onClick,
  activated,
}) => {
  return (
    <IonFab
      vertical="bottom"
      horizontal="end"
      slot="fixed"
      activated={activated}
    >
      <IonFabButton onClick={onClick} closeIcon={chevronDownOutline}>
        <IonIcon icon={chevronUpOutline} />
      </IonFabButton>
    </IonFab>
  );
};

export default ScrollToTopFab;
