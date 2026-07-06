import WindowButtons from "#/core/tauri/WindowButtons";
import { isTauri } from "#/helpers/device";

import styles from "./TwoColumnEmpty.module.css";

export default function TwoColumnEmpty() {
  return (
    <div className={styles.container}>
      {isTauri() && (
        <div className={styles.windowButtons}>
          <WindowButtons />
        </div>
      )}
      <img src="/logo.png" alt="" />
    </div>
  );
}
