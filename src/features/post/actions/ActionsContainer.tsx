import { cx } from "#/helpers/css";

import styles from "./ActionsContainer.module.css";

export default function ActionsContainer(
  props: React.HTMLAttributes<HTMLDivElement>,
) {
  return (
    <div {...props} className={cx(props.className, styles.actionsContainer)} />
  );
}
