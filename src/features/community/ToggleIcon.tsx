import { IonIcon } from "@ionic/react";
import { css, cx } from "@linaria/core";
import { styled } from "@linaria/react";
import { ComponentProps } from "react";

const BaseIonIcon = styled(IonIcon)`
  font-size: 24px;
`;

const selectedStyles = css`
  color: var(--ion-color-primary);
`;

const unselectedStyles = css`
  opacity: 0.08;
`;

interface ToggleIconProps extends ComponentProps<typeof IonIcon> {
  selected: boolean;
}

export function ToggleIcon({ selected, ...props }: ToggleIconProps) {
  return (
    <BaseIonIcon
      {...props}
      className={cx(
        props.className,
        selected ? selectedStyles : unselectedStyles,
      )}
    />
  );
}
