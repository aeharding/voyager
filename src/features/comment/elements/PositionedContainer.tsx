import React from "react";

import { sv } from "#/helpers/css";

import styles from "./PositionedContainer.module.css";

interface PositionedContainerProps extends React.PropsWithChildren {
  depth: number;
}

export function PositionedContainer({
  depth,
  ...props
}: PositionedContainerProps) {
  return (
    <div
      {...props}
      className={styles.positionedContainer}
      style={sv({ depth })}
    />
  );
}
