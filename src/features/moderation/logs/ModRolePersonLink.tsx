import { IonIcon } from "@ionic/react";
import React from "react";

import PersonLink from "#/features/labels/links/PersonLink";

import { getModColor, getModIcon, ModeratorRole } from "../useCanModerate";

import styles from "./ModRolePersonLink.module.css";

interface ModRolePersonLinkProps
  extends Omit<React.ComponentProps<typeof PersonLink>, "color" | "prefix"> {
  role: ModeratorRole;
}

export default function ModRolePersonLink({
  role,
  ...rest
}: ModRolePersonLinkProps) {
  const color = `var(--ion-color-${getModColor(role)}-shade)`;
  const prefix = <IonIcon icon={getModIcon(role)} className={styles.icon} />;

  return <PersonLink color={color} prefix={prefix} {...rest} />;
}
