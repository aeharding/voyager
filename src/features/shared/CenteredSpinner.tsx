import { IonSpinner } from "@ionic/react";
import { styled } from "@linaria/react";

export const CenteredSpinner = styled(IonSpinner)`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;
