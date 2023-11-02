import styled from "@emotion/styled";
import { IonItem } from "@ionic/react";

export const ListHeader = styled.div`
  font-size: 0.8em;
  margin: 32px 0 -8px 32px;
  text-transform: uppercase;
  color: var(--ion-color-medium);
`;

export const InsetIonItem = styled(IonItem)`
  --background: var(--ion-tab-bar-background, var(--ion-color-step-50, #fff));
`;

export const HelperText = styled.div`
  margin: 0 32px;
  font-size: 0.875em;
  color: var(--ion-color-medium);
`;
