import {
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
} from "@ionic/react";
import { star } from "ionicons/icons";
import { Community } from "lemmy-js-client";
import { useMemo } from "react";

import { loggedInSelector } from "#/features/auth/authSelectors";
import ItemIcon from "#/features/labels/img/ItemIcon";
import { ActionButton } from "#/features/post/actions/ActionButton";
import { attributedPreventOnClickNavigationBug } from "#/helpers/ionic";
import { getHandle } from "#/helpers/lemmy";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import {
  buildFavorited,
  buildProblemSubscribing,
  buildSuccessSubscribing,
} from "#/helpers/toastMessages";
import useAppToast from "#/helpers/useAppToast";
import { useAppDispatch, useAppSelector } from "#/store";

import {
  addFavorite,
  followCommunity,
  removeFavorite,
} from "../../communitySlice";
import { ToggleIcon } from "../../ToggleIcon";

import listStyles from "../ResolvedCommunitiesList.module.css";
import styles from "./CommunityListItem.module.css";

interface CommunityListItemProps {
  community: Community | string;
  favorites?: string[];
  removeAction: "follow" | "favorite" | "none";
  line: boolean | undefined;
  className?: string;
}

export default function CommunityListItem({
  community,
  favorites,
  removeAction,
  line,
  className,
}: CommunityListItemProps) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const dispatch = useAppDispatch();
  const presentToast = useAppToast();

  const loggedIn = useAppSelector(loggedInSelector);

  const handle =
    typeof community === "string" ? community : getHandle(community);

  const isFavorite = useMemo(
    () => favorites?.includes(handle) ?? false,
    [favorites, handle],
  );

  async function unsubscribe() {
    if (typeof community === "string") return;

    try {
      await dispatch(followCommunity(false, community.id));
      presentToast(buildSuccessSubscribing(true));
    } catch (error) {
      presentToast(buildProblemSubscribing(true));
      throw error;
    }
  }

  function unfavorite() {
    const communityHandle =
      typeof community === "string" ? community : getHandle(community);

    dispatch(removeFavorite(communityHandle));

    presentToast(buildFavorited(isFavorite));
  }

  const slideActions = (() => {
    if (!loggedIn) return;

    switch (removeAction) {
      case "favorite":
        return (
          <IonItemOptions side="end" onIonSwipe={unfavorite}>
            <IonItemOption expandable onClick={unfavorite}>
              Unfavorite
            </IonItemOption>
          </IonItemOptions>
        );
      case "follow":
        return (
          <IonItemOptions side="end" onIonSwipe={unsubscribe}>
            <IonItemOption expandable onClick={unsubscribe}>
              Unsubscribe
            </IonItemOption>
          </IonItemOptions>
        );
      case "none":
        return;
    }
  })();

  return (
    <IonItemSliding>
      <IonItem
        {...attributedPreventOnClickNavigationBug}
        routerLink={buildGeneralBrowseLink(`/c/${handle}`)}
        detail={false}
        lines={line ? "inset" : "none"}
        className={className}
      >
        <div className={listStyles.content}>
          <ItemIcon item={community} size={28} />
          {handle}
        </div>
        {loggedIn && (
          <ActionButton
            slot="end"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();

              if (!isFavorite) {
                dispatch(addFavorite(handle));
              } else {
                dispatch(removeFavorite(handle));
              }
            }}
          >
            <ToggleIcon
              className={styles.toggleIcon}
              icon={star}
              selected={isFavorite}
            />
          </ActionButton>
        )}
      </IonItem>

      {slideActions}
    </IonItemSliding>
  );
}
