import styles from "./Color.module.css";

interface ColorProps {
  color: string;
}

export default function Color({ color }: ColorProps) {
  return (
    <div className={styles.container} style={{ backgroundColor: color }} />
  );
}
