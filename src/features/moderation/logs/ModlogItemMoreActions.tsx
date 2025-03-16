import { IonIcon, useIonActionSheet } from "@ionic/react";
import { compact } from "es-toolkit";
import {
  ellipsisHorizontal,
  peopleOutline,
  personOutline,
} from "ionicons/icons";
import { useCallback, useImperativeHandle } from "react";

import { getHandle } from "#/helpers/lemmy";
import useAppNavigation from "#/helpers/useAppNavigation";

import { getModIcon, ModeratorRole } from "../useCanModerate";
import { ModlogItemType } from "./helpers";

import styles from "./ModlogItemMoreActions.module.css";

interface ModlogItemMoreActions {
  item: ModlogItemType;
  role: ModeratorRole;
  ref: React.RefObject<ModlogItemMoreActionsHandle | undefined>;
}

export interface ModlogItemMoreActionsHandle {
  present: () => void;
}

export default function ModlogItemMoreActions({
  item,
  role,
  ref,
}: ModlogItemMoreActions) {
  const { navigateToCommunity, navigateToUser } = useAppNavigation();
  const [presentActionSheet] = useIonActionSheet();

  const community = "community" in item ? item.community : undefined;

  const person = (() => {
    if ("commenter" in item) return item.commenter;
    if ("banned_person" in item) return item.banned_person;
    if ("modded_person" in item) return item.modded_person;
  })();

  const moderator = (() => {
    if ("moderator" in item) return item.moderator;
    if ("admin" in item) return item.admin;
  })();

  const present = useCallback(() => {
    presentActionSheet({
      cssClass: "left-align-buttons",
      buttons: compact([
        person
          ? {
              text: getHandle(person),
              icon: personOutline,
              handler: () => {
                navigateToUser(person);
              },
            }
          : undefined,
        community
          ? {
              text: getHandle(community),
              icon: peopleOutline,
              handler: () => {
                navigateToCommunity(community);
              },
            }
          : undefined,
        moderator
          ? {
              text: getHandle(moderator),
              icon: getModIcon(role),
              cssClass: role,
              handler: () => {
                navigateToUser(moderator);
              },
            }
          : undefined,
        {
          text: "Cancel",
          role: "cancel",
        },
      ]),
    });
  }, [
    community,
    moderator,
    navigateToCommunity,
    navigateToUser,
    person,
    presentActionSheet,
    role,
  ]);

  useImperativeHandle(
    ref,
    () => ({
      present,
    }),
    [present],
  );

  return (
    <button className={styles.button}>
      <IonIcon
        className={styles.ellipsisIcon}
        icon={ellipsisHorizontal}
        onClick={(e) => {
          e.stopPropagation();
          present();
        }}
      />
    </button>
  );
}
