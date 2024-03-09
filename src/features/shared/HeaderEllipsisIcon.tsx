import { IonIcon } from "@ionic/react";
import { css, cx } from "@linaria/core";
import { ellipsisHorizontal } from "ionicons/icons";
import { ComponentProps } from "react";

const rotateCss = css`
  &.md {
    transform: rotate(90deg);
  }
`;

export default function HeaderEllipsisIcon(
  props: ComponentProps<typeof IonIcon>,
) {
  return (
    <IonIcon
      {...props}
      icon={ellipsisHorizontal}
      className={cx(rotateCss, props.className)}
    />
  );
}
