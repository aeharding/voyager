import { IonSpinner } from "@ionic/react";

import { cx } from "#/helpers/css";

import styles from "./CenteredSpinner.module.css";

export function CenteredSpinner(
  props: React.ComponentProps<typeof IonSpinner>,
) {
  return (
    <IonSpinner
      {...props}
      className={cx(props.className, styles.centeredSpinner)}
    />
  );
}
