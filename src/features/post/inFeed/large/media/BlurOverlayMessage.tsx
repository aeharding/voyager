import { IonIcon } from "@ionic/react";
import { alertCircle } from "ionicons/icons";

import { cx } from "#/helpers/css";

import { LARGE_POST_MEDIA_CONTAINER_CLASSNAME } from "../LargePostContents";

import styles from "./BlurOverlayMessage.module.css";

const BLUR_OVERLAY_CONTAINER_CLASSNAME = "blur-overlay-container";

export default function BlurOverlayMessage() {
  return (
    <div
      className={cx(styles.messageContainer, BLUR_OVERLAY_CONTAINER_CLASSNAME)}
    >
      <IonIcon icon={alertCircle} className={styles.warningIcon} />
      <div className={styles.title}>NSFW</div>
      <div className={styles.description}>Sensitive content — tap to view</div>
    </div>
  );
}

export function findBlurOverlayContainer(
  imgEl: HTMLElement,
): HTMLElement | undefined {
  const el = imgEl
    .closest(`.${LARGE_POST_MEDIA_CONTAINER_CLASSNAME}`)
    ?.querySelector(`.${BLUR_OVERLAY_CONTAINER_CLASSNAME}`);

  if (el instanceof HTMLElement) return el;
}
