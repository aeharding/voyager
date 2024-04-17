import { IonIcon } from "@ionic/react";
import { css, cx } from "@linaria/core";

const baseClass = css`
  display: flex;
  align-items: center;
  gap: 3px;
`;

const baseIconClass = css`
  font-size: 1.2em;
`;

interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  statEl?: JSX.ElementType;
  icon: string;
  iconClassName?: string;
  children?: React.ReactNode;
}

export default function Stat({
  statEl: Container = "div", // Pass PlainButton when interactive
  icon,
  iconClassName,
  className,
  children,
  ...rest
}: StatProps) {
  return (
    <Container {...rest} className={cx(className, baseClass)}>
      <IonIcon icon={icon} className={cx(iconClassName, baseIconClass)} />
      {children}
    </Container>
  );
}
