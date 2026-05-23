import { IonIcon, useIonActionSheet } from "@ionic/react";
import { compact } from "es-toolkit";
import {
  ellipsisHorizontal,
  peopleOutline,
  personOutline,
} from "ionicons/icons";
import { useCallback, useImperativeHandle } from "react";
import { ModlogItem as ModlogItemType } from "threadiverse";

import { getHandle } from "#/helpers/lemmy";
import useAppNavigation from "#/helpers/useAppNavigation";

import { getModIcon, ModeratorRole } from "../useCanModerate";

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

  const community = item.target_community;
  const person = item.target_person;
  const moderator = item.moderator;

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
