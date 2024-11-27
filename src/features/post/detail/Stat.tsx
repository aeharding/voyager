import { IonIcon } from "@ionic/react";

import { cx } from "#/helpers/css";

import sharedStyles from "#/features/shared/shared.module.css";
import styles from "./Stat.module.css";

interface StatProps
  extends React.HTMLAttributes<HTMLDivElement & HTMLButtonElement> {
  button?: boolean;
  icon: string;
  iconClassName?: string;
  children?: React.ReactNode;
}

export default function Stat({
  button,
  icon,
  iconClassName,
  className,
  children,
  ...rest
}: StatProps) {
  const El = button ? "button" : "div";

  return (
    <El
      {...rest}
      className={cx(className, styles.base, button && sharedStyles.plainButton)}
    >
      <IonIcon icon={icon} className={cx(iconClassName, styles.baseIcon)} />
      {children}
    </El>
  );
}
