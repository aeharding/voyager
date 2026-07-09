// Inlined so the watermark renders in the snapshot on all platforms
// (modern-screenshot can't fetch() app-internal tauri:// resources)
import logo from "./logo.png?inline";

import styles from "./Watermark.module.css";

export default function Watermark() {
  return (
    <div className={styles.container}>
      <div className={styles.text}>Voyager for Lemmy</div>
      <img alt="" src={logo} className={styles.logoImg} />
    </div>
  );
}
