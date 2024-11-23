import { ButtonHTMLAttributes } from "react";

import { cx } from "#/helpers/css";

import styles from "./ActionButton.module.css";

export function ActionButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={cx(styles.button, props.className)} />;
}
