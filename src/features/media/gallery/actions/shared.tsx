import React from "react";

import { cx } from "#/helpers/css";

import styles from "./shared.module.css";

export function BottomContainer({ children }: React.PropsWithChildren) {
  return <div className={styles.bottomContainer}>{children}</div>;
}

interface BottomContainerActionsProps extends React.PropsWithChildren {
  withBg: boolean;
}

export function BottomContainerActions({
  withBg,
  children,
}: BottomContainerActionsProps) {
  return (
    <div className={cx(styles.bottomContainerActions, withBg && styles.withBg)}>
      {children}
    </div>
  );
}
