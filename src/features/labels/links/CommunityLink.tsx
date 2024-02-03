import { getHandle } from "../../../helpers/lemmy";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { Community, SubscribedType } from "lemmy-js-client";
import Handle from "../Handle";
import { StyledLink, hideCss } from "./shared";
import ItemIcon from "../img/ItemIcon";
import { css } from "@emotion/react";
import { useIonActionSheet } from "@ionic/react";
import { LongPressOptions, useLongPress } from "use-long-press";
import {
  heartDislikeOutline,
  heartOutline,
  removeCircleOutline,
  tabletPortraitOutline,
} from "ionicons/icons";
import useCommunityActions from "../../community/useCommunityActions";
import { useCallback, useContext } from "react";
import { ShareImageContext } from "../../share/asImage/ShareAsImage";
import { preventOnClickNavigationBug } from "../../../helpers/ionic";

interface CommunityLinkProps {
  community: Community;
  showInstanceWhenRemote?: boolean;
  subscribed: SubscribedType;
  showIcon?: boolean;

  className?: string;
}

export default function CommunityLink({
  community,
  showInstanceWhenRemote,
  className,
  subscribed,
  showIcon = true,
}: CommunityLinkProps) {
  const [present] = useIonActionSheet();

  const handle = getHandle(community);
  const { hideCommunity } = useContext(ShareImageContext);

  const { isSubscribed, isBlocked, subscribe, block, sidebar } =
    useCommunityActions(community, subscribed);

  const onCommunityLinkLongPress = useCallback(() => {
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
  }, [block, isBlocked, isSubscribed, present, sidebar, subscribe]);

  const bind = useLongPress(onCommunityLinkLongPress, {
    cancelOnMovement: true,
    onStart,
  });

  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  return (
    <StyledLink
      to={buildGeneralBrowseLink(`/c/${handle}`)}
      onClick={(e) => {
        e.stopPropagation();
        preventOnClickNavigationBug(e);
      }}
      className={className}
      css={hideCommunity ? hideCss : undefined}
      {...bind()}
    >
      {showIcon && !hideCommunity && (
        <ItemIcon
          item={community}
          size={24}
          css={css`
            margin-right: 0.4rem;
            vertical-align: middle;
          `}
        />
      )}

      <Handle
        item={community}
        showInstanceWhenRemote={showInstanceWhenRemote}
      />
    </StyledLink>
  );
}

const onStart: LongPressOptions["onStart"] = (e) => {
  e.stopPropagation();
};
