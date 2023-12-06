import styled from "@emotion/styled";
import { IonIcon } from "@ionic/react";
import { css } from "@emotion/react";

export const ToggleIcon = styled(IonIcon)<{ selected: boolean }>`
  font-size: 24px;

  ${({ selected }) =>
    selected
      ? css`
          color: var(--ion-color-primary);
        `
      : css`
          opacity: 0.08;
        `}
`;
