import { IonIcon } from "@ionic/react";
import { imageOutline } from "ionicons/icons";
import { HTMLAttributes } from "react";

import { cx, sv } from "#/helpers/css";

import styles from "./MediaPlaceholder.module.css";

type State = "loading" | "loaded" | "error" | "custom";

interface MediaPlaceholderProps extends HTMLAttributes<HTMLDivElement> {
  state: State;
  defaultAspectRatio?: number;
  children?: React.ReactNode;
}

export default function MediaPlaceholder({
  state,
  className,
  children,
  defaultAspectRatio = 1.2,
  ...rest
}: MediaPlaceholderProps) {
  function renderIcon() {
    switch (state) {
      case "loading":
        return <IonIcon className={styles.loadingIcon} icon={imageOutline} />;
      case "error":
        return <span className={styles.error}>failed to load media 😢</span>;
      case "custom":
      case "loaded":
        return;
    }
  }

  return (
    <span
      {...rest}
      className={cx(
        styles.placeholderContainer,
        className,
        state !== "loaded" && "not-loaded",
      )}
      style={{ ...rest.style, ...sv({ defaultAspectRatio }) }}
    >
      {children}
      {renderIcon()}
    </span>
  );
}
