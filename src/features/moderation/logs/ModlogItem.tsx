import { IonIcon, IonItem } from "@ionic/react";
import { timerOutline } from "ionicons/icons";

import Ago from "#/features/labels/Ago";
import { cx } from "#/helpers/css";
import { isTouchDevice } from "#/helpers/device";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";

import {
  getModColor,
  getModIcon,
  getModName,
  ModeratorRole,
} from "../useCanModerate";
import useIsAdmin from "../useIsAdmin";
import { ModlogItemType } from "./helpers";
import ModlogItemMoreActions from "./ModlogItemMoreActions";
import addCommunity from "./types/addCommunity";
import addInstance from "./types/addInstance";
import banFromCommunity from "./types/banFromCommunity";
import banFromInstance from "./types/banFromInstance";
import featurePost from "./types/featurePost";
import hideCommunity from "./types/hideCommunity";
import lockPost from "./types/lockPost";
import purgeComment from "./types/purgeComment";
import purgeCommunity from "./types/purgeCommunity";
import purgePerson from "./types/purgePerson";
import purgePost from "./types/purgePost";
import removeComment from "./types/removeComment";
import removeCommunity from "./types/removeCommunity";
import removePost from "./types/removePost";
import transferCommunity from "./types/transferCommunity";

import sharedStyles from "#/features/shared/shared.module.css";
import styles from "./ModlogItem.module.css";

interface ModLogItemProps {
  item: ModlogItemType;
}

export interface LogEntryData {
  icon: string;
  title: string;
  when: string;
  message?: string;
  reason?: string;
  expires?: string;
  by?: string;
  role?: ModeratorRole;
  link?: string;
}

function renderModlogData(item: ModlogItemType): LogEntryData {
  switch (true) {
    case "mod_remove_comment" in item:
      return removeComment(item);
    case "mod_remove_post" in item:
      return removePost(item);
    case "mod_lock_post" in item:
      return lockPost(item);
    case "mod_feature_post" in item:
      return featurePost(item);
    case "mod_remove_community" in item:
      return removeCommunity(item);
    case "mod_ban_from_community" in item:
      return banFromCommunity(item);
    case "mod_ban" in item:
      return banFromInstance(item);
    case "mod_add_community" in item:
      return addCommunity(item);
    case "mod_transfer_community" in item:
      return transferCommunity(item);
    case "mod_add" in item:
      return addInstance(item);
    case "admin_purge_person" in item:
      return purgePerson(item);
    case "admin_purge_community" in item:
      return purgeCommunity(item);
    case "admin_purge_post" in item:
      return purgePost(item);
    case "admin_purge_comment" in item:
      return purgeComment(item);
    case "mod_hide_community" in item:
      return hideCommunity(item);
    default:
      // should never happen (type = never)
      //
      // If item is not type = never, then some mod log action was added
      // and needs to be handled.
      return item;
  }
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

  const isAdmin = useIsAdmin(
    (() => {
      if ("admin" in item) return item.admin;
      if ("moderator" in item) return item.moderator;
    })(),
  );

  const role = (() => {
    if (by && isAdmin) return "admin-local";
    if ("admin" in item) return "admin-remote";

    return role_ ?? "mod";
  })();

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
    >
      <div className={styles.container}>
        <div className={styles.startContent}>
          <IonIcon icon={icon} className={styles.typeIcon} />
        </div>
        <div className={styles.content}>
          <div className={styles.header}>
            <div>{title}</div>
            <aside>
              <ModlogItemMoreActions item={item} role={role} />
              <Ago date={when} />
            </aside>
          </div>
          <div className={styles.body}>{message}</div>
          {reason && <div>Reason: {reason}</div>}
          <div className={styles.footer}>
            <div
              className={styles.by}
              style={{ color: `var(--ion-color-${getModColor(role)}-shade)` }}
            >
              <IonIcon icon={getModIcon(role)} />
              {by ? by : getModName(role)}
            </div>
            {expires && (
              <aside>
                <IonIcon icon={timerOutline} /> <Ago date={expires} />
              </aside>
            )}
          </div>
        </div>
      </div>
    </IonItem>
  );
}
