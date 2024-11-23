import { useState } from "react";

import { cx } from "#/helpers/css";

import styles from "./AltText.module.css";

interface AltTextProps {
  alt?: string;
}

export default function AltText({ alt }: AltTextProps) {
  const [shouldClampAltText, setShouldClampAltText] = useState(true);

  if (!alt) return;

  return (
    <div className={styles.container}>
      <div
        className={styles.text}
        onClick={() => setShouldClampAltText((v) => !v)}
      >
        <div className={styles.dynamicHeightBg}>
          <div className={styles.color} />
        </div>
        <div className={cx(styles.clamped, shouldClampAltText && styles.clamp)}>
          {alt}
        </div>
      </div>
    </div>
  );
}
