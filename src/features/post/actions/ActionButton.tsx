import { ButtonHTMLAttributes } from "react";

import styles from "./ActionButton.module.css";

export function ActionButton(
  props: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">,
) {
  return <button {...props} className={styles.button} />;
}
