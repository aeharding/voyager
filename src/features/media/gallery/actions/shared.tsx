import { cx } from "#/helpers/css";

import styles from "./shared.module.css";

export function BottomContainer() {
  return <div className={styles.bottomContainer} />;
}

interface BottomContainerActionsProps {
  withBg: boolean;
}

export function BottomContainerActions({
  withBg,
}: BottomContainerActionsProps) {
  return (
    <div
      className={cx(styles.bottomContainerActions, withBg && styles.withBg)}
    />
  );
}
