import { useState } from "react";

import { cx } from "#/helpers/css";
import { useAppSelector } from "#/store";

import styles from "./AltText.module.css";

interface AltTextProps {
  alt?: string;
  title?: string;
}

export default function AltText({ alt, title }: AltTextProps) {
  const hideAltText = useAppSelector(
    (state) => state.settings.general.media.hideAltText,
  );
  const [shouldClampAltText, setShouldClampAltText] = useState(true);

  if ((!alt && !title) || hideAltText) return;

  const content = (() => {
    if (alt && title)
      return (
        <>
          {alt}
          <br />
          <em>{title}</em>
        </>
      );

    if (alt) return alt;
    if (title) return <em>{title}</em>;
  })();

  return (
    <div className={cx("alt-text", styles.container)}>
      <div
        className={styles.text}
        onClick={() => setShouldClampAltText((v) => !v)}
      >
        <div className={styles.dynamicHeightBg}>
          <div className={styles.color} />
        </div>
        <div className={cx(styles.clamped, shouldClampAltText && styles.clamp)}>
          {content}
        </div>
      </div>
    </div>
  );
}
