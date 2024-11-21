import { IonIcon } from "@ionic/react";
import { ComponentProps } from "react";

import { cx } from "#/helpers/css";

import styles from "./ToggleIcon.module.css";

interface ToggleIconProps extends ComponentProps<typeof IonIcon> {
  selected: boolean;
}

export function ToggleIcon({ selected, ...props }: ToggleIconProps) {
  return (
    <IonIcon
      {...props}
      className={cx(
        props.className,
        styles.base,
        selected ? styles.selected : styles.unselected,
      )}
    />
  );
}
