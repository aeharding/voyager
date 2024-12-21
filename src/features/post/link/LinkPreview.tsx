import { IonIcon } from "@ionic/react";
import {
  albumsOutline,
  chatboxSharp,
  linkSharp,
  mailOpen,
  peopleSharp,
  personSharp,
} from "ionicons/icons";
import { ReactNode, useMemo } from "react";

import { LemmyObjectType } from "#/features/shared/useLemmyUrlHandler";
import type { determineTypeFromUrl } from "#/helpers/url";

import styles from "./LinkPreview.module.css";

interface LinkPreviewProps {
  type: LemmyObjectType | ReturnType<typeof determineTypeFromUrl>;
}

export default function LinkPreview({ type }: LinkPreviewProps): ReactNode {
  const icon = useMemo(() => {
    switch (type) {
      case "comment":
        return chatboxSharp;
      case "community":
        return peopleSharp;
      case "post":
        return albumsOutline;
      case "user":
        return personSharp;
      case "mail":
        return mailOpen;
      case undefined:
        return linkSharp;
    }
  }, [type]);

  return <IonIcon icon={icon} className={styles.linkIcon} />;
}
