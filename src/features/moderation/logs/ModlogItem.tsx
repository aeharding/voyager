import { IonIcon, IonItem } from "@ionic/react";
import { timerOutline } from "ionicons/icons";
import { useCallback } from "react";
import { useRef } from "react";
import {
  ModlogItem as ModLogItemType,
  ModlogKind,
  Person,
} from "threadiverse";
import { useLongPress } from "use-long-press";

import Ago from "#/features/labels/Ago";
import { cx } from "#/helpers/css";
import { isTouchDevice } from "#/helpers/device";
import { stopIonicTapClick } from "#/helpers/ionic";
import { filterEvents } from "#/helpers/longPress";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";

import { ModeratorRole } from "../useCanModerate";
import useIsAdmin from "../useIsAdmin";
import ModlogItemMoreActions, {
  ModlogItemMoreActionsHandle,
} from "./ModlogItemMoreActions";
import ModRolePersonLink from "./ModRolePersonLink";
import addCommunity from "./types/addCommunity";
import addInstance from "./types/addInstance";
import banFromCommunity from "./types/banFromCommunity";
import banFromInstance from "./types/banFromInstance";
import featurePost from "./types/featurePost";
import hideCommunity from "./types/hideCommunity";
import lockComment from "./types/lockComment";
import lockPost from "./types/lockPost";
import purgeComment from "./types/purgeComment";
import purgeCommunity from "./types/purgeCommunity";
import purgePerson from "./types/purgePerson";
import purgePost from "./types/purgePost";
import removeComment from "./types/removeComment";
import removeCommunity from "./types/removeCommunity";
import removePost from "./types/removePost";
import transferCommunity from "./types/transferCommunity";
import warnComment from "./types/warnComment";
import warnPost from "./types/warnPost";

import sharedStyles from "#/features/shared/shared.module.css";
import styles from "./ModlogItem.module.css";

interface ModLogItemProps {
  item: ModLogItemType;
}

export interface LogEntryData {
  icon: string;
  title: string;
  when: string;
  message?: string;
  reason?: string;
  expires?: string;
  by?: Person;
  role?: ModeratorRole;
  link?: string;
}

function renderModlogData(item: ModLogItemType): LogEntryData {
  const kind = item.modlog.kind;
  switch (kind) {
    case "mod_remove_comment":
      return removeComment(item);
    case "mod_remove_post":
      return removePost(item);
    case "mod_lock_post":
      return lockPost(item);
    case "mod_lock_comment":
      return lockComment(item);
    case "mod_feature_post_community":
    case "admin_feature_post_site":
      return featurePost(item);
    case "admin_remove_community":
      return removeCommunity(item);
    case "mod_ban_from_community":
      return banFromCommunity(item);
    case "admin_ban":
      return banFromInstance(item);
    case "mod_add_to_community":
      return addCommunity(item);
    case "mod_transfer_community":
      return transferCommunity(item);
    case "admin_add":
      return addInstance(item);
    case "admin_purge_person":
      return purgePerson(item);
    case "admin_purge_community":
      return purgeCommunity(item);
    case "admin_purge_post":
      return purgePost(item);
    case "admin_purge_comment":
      return purgeComment(item);
    case "mod_change_community_visibility":
      return hideCommunity(item);
    case "mod_warn_comment":
      return warnComment(item);
    case "mod_warn_post":
      return warnPost(item);
    default:
      kind satisfies never;
      throw new Error(`Unknown modlog kind: ${kind}`);
  }
}

function isAdminActionKind(kind: ModlogKind): boolean {
  return kind.startsWith("admin_");
}

export function ModlogItem({ item }: ModLogItemProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const {
    icon,
    title,
    when,
    by,
    role: role_,
    message,
    reason,
    expires,
    link,
  } = renderModlogData(item);

  const isAdminAction = isAdminActionKind(item.modlog.kind);
  const isAdmin = useIsAdmin(item.moderator);

  const role = (() => {
    if (by && isAdmin) return "admin-local";
    if (isAdminAction) return "admin-remote";

    return role_ ?? "mod";
  })();

  const ellipsisHandleRef = useRef<ModlogItemMoreActionsHandle>(undefined);

  const onCommentLongPress = useCallback(() => {
    ellipsisHandleRef.current?.present();
    stopIonicTapClick();
  }, []);

  const bind = useLongPress(onCommentLongPress, {
    threshold: 800,
    cancelOnMovement: 15,
    filterEvents,
  });

  return (
    <IonItem
      mode="ios" // Use iOS style activatable tap highlight
      className={cx(
        isTouchDevice() && "ion-activatable",
        sharedStyles.maxWidth,
      )}
      href={undefined}
      routerLink={link ? buildGeneralBrowseLink(link) : undefined}
      detail={false}
      {...bind()}
    >
      <div className={styles.container}>
        <div className={styles.startContent}>
          <IonIcon icon={icon} className={styles.typeIcon} />
        </div>
        <div className={styles.content}>
          <div className={styles.header}>
            <div>{title}</div>
            <aside>
              <ModlogItemMoreActions
                item={item}
                role={role}
                ref={ellipsisHandleRef}
              />
              <Ago date={when} />
            </aside>
          </div>
          <div className={styles.body}>{message}</div>
          {reason && <div>Reason: {reason}</div>}
          <div className={styles.footer}>
            {by && <ModRolePersonLink role={role} person={by} />}
            {expires && (
              <aside>
                <IonIcon icon={timerOutline} className={styles.agoIcon} />{" "}
                <Ago date={when} to={expires} />
              </aside>
            )}
          </div>
        </div>
      </div>
    </IonItem>
  );
}
