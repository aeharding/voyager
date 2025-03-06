import { IonIcon, useIonActionSheet } from "@ionic/react";
import {
  heart,
  heartDislikeOutline,
  heartOutline,
  removeCircleOutline,
  tabletPortraitOutline,
} from "ionicons/icons";
import { Community, SubscribedType } from "lemmy-js-client";
import { createContext, useContext } from "react";
import { Link } from "react-router-dom";
import { LongPressOptions, useLongPress } from "use-long-press";

import useCommunityActions from "#/features/community/useCommunityActions";
import ItemIcon from "#/features/labels/img/ItemIcon";
import { ShareImageContext } from "#/features/share/asImage/ShareAsImage";
import { cx } from "#/helpers/css";
import {
  preventOnClickNavigationBug,
  stopIonicTapClick,
} from "#/helpers/ionic";
import { getHandle } from "#/helpers/lemmy";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import { OShowSubscribedIcon } from "#/services/db";
import { useAppSelector } from "#/store";

import { renderHandle } from "../Handle";

import styles from "./CommunityLink.module.css";
import sharedStyles from "./shared.module.css";

interface CommunityLinkProps {
  community: Community;
  showInstanceWhenRemote?: boolean;
  subscribed: SubscribedType;
  tinyIcon?: boolean;
  disableInstanceClick?: boolean;
  hideIcon?: boolean;
  hideSubscribed?: boolean;

  className?: string;
}

export default function CommunityLink({
  community,
  showInstanceWhenRemote,
  className,
  subscribed,
  tinyIcon,
  disableInstanceClick,
  hideIcon,
  hideSubscribed,
}: CommunityLinkProps) {
  const [present] = useIonActionSheet();

  const handle = getHandle(community);
  const { hideCommunity } = useContext(ShareImageContext);

  const showCommunityIcons = useAppSelector(
    (state) => state.settings.appearance.posts.showCommunityIcons,
  );

  const accommodateLargeText = useAppSelector(
    (state) => state.settings.appearance.font.accommodateLargeText,
  );

  const communityAtTop = useAppSelector(
    (state) => state.settings.appearance.posts.communityAtTop,
  );

  const showSubscribed = useShowSubscribedIcon();

  const { isSubscribed, isBlocked, subscribe, block, sidebar } =
    useCommunityActions(community, subscribed);

  function onCommunityLinkLongPress() {
    stopIonicTapClick();
    present({
      cssClass: "left-align-buttons",
      buttons: [
        {
          text: `${isBlocked ? "Unblock" : "Block"} Community`,
          icon: removeCircleOutline,
          role: "destructive",
          handler: () => {
            block();
          },
        },
        {
          text: !isSubscribed ? "Subscribe" : "Unsubscribe",
          icon: !isSubscribed ? heartOutline : heartDislikeOutline,
          handler: () => {
            subscribe();
          },
        },
        {
          text: "Sidebar",
          data: "sidebar",
          icon: tabletPortraitOutline,
          handler: () => {
            sidebar();
          },
        },
        {
          text: "Cancel",
          role: "cancel",
        },
      ],
    });
  }

  const bind = useLongPress(onCommunityLinkLongPress, {
    cancelOnMovement: 15,
    onStart,
  });

  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const [name, instance] = renderHandle({
    item: community,
    showInstanceWhenRemote,
  });

  const end = (
    <>
      {instance}
      {showSubscribed && !hideSubscribed && isSubscribed && (
        <IonIcon icon={heart} className={styles.subscribedIcon} />
      )}
    </>
  );

  if (accommodateLargeText && communityAtTop) {
    return (
      <div className={sharedStyles.linkContainerParentLarge}>
        <div>
          {showCommunityIcons && !hideCommunity && !hideIcon && (
            <ItemIcon
              item={community}
              size={tinyIcon ? 16 : 24}
              className={styles.itemIcon}
            />
          )}
        </div>

        <div className={sharedStyles.linkContainerChildLarge}>
          <Link
            className={sharedStyles.link}
            to={buildGeneralBrowseLink(`/c/${handle}`)}
            onClick={(e) => {
              e.stopPropagation();
              preventOnClickNavigationBug(e);
            }}
            draggable={false}
          >
            {name}

            {!disableInstanceClick && end}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <span
      {...bind()}
      className={cx(
        sharedStyles.linkContainer,
        className,
        hideCommunity ? sharedStyles.hide : undefined,
      )}
    >
      <Link
        className={sharedStyles.link}
        to={buildGeneralBrowseLink(`/c/${handle}`)}
        onClick={(e) => {
          e.stopPropagation();
          preventOnClickNavigationBug(e);
        }}
        draggable={false}
      >
        {showCommunityIcons && !hideCommunity && !hideIcon && (
          <ItemIcon
            item={community}
            size={tinyIcon ? 16 : 24}
            className={styles.itemIcon}
          />
        )}

        {name}
        {!disableInstanceClick && end}
      </Link>
      {disableInstanceClick && end}
    </span>
  );
}

const onStart: LongPressOptions["onStart"] = (e) => {
  e.stopPropagation();
};

function useShowSubscribedIcon() {
  const feedEnabled = useContext(ShowSubscribedIconContext);
  const subscribedIcon = useAppSelector(
    (state) => state.settings.appearance.posts.subscribedIcon,
  );

  switch (subscribedIcon) {
    case OShowSubscribedIcon.OnlyAllLocal:
      return feedEnabled;
    case OShowSubscribedIcon.Never:
      return false;
    case OShowSubscribedIcon.Everywhere:
      return true;
  }
}

export const ShowSubscribedIconContext = createContext(false);
