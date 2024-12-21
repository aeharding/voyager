import styles from "./formatting.module.css";

export function ListHeader(props: React.PropsWithChildren) {
  return <div {...props} className={styles.listHeader} />;
}

export function HelperText(props: React.PropsWithChildren) {
  return <div {...props} className={styles.helperText} />;
}
