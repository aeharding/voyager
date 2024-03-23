import { getHandle } from "../../../helpers/lemmy";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { Community, SubscribedType } from "lemmy-js-client";
import { renderHandle } from "../Handle";
import { LinkContainer, StyledLink, hideCss } from "./shared";
import ItemIcon from "../img/ItemIcon";
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
import { styled } from "@linaria/react";
import { cx } from "@linaria/core";
import { useAppSelector } from "../../../store";

const StyledItemIcon = styled(ItemIcon)`
  margin-right: 0.4rem;
  vertical-align: middle;
`;

interface CommunityLinkProps {
  community: Community;
  showInstanceWhenRemote?: boolean;
  subscribed: SubscribedType;
  tinyIcon?: boolean;
  disableInstanceClick?: boolean;

  className?: string;
}

export default function CommunityLink({
  community,
  showInstanceWhenRemote,
  className,
  subscribed,
  tinyIcon,
  disableInstanceClick,
}: CommunityLinkProps) {
  const [present] = useIonActionSheet();

  const handle = getHandle(community);
  const { hideCommunity } = useContext(ShareImageContext);
  const showCommunityIcons = useAppSelector(
    (state) => state.settings.appearance.posts.showCommunityIcons,
  );

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
    cancelOnMovement: 15,
    onStart,
  });

  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const [name, instance] = renderHandle({
    item: community,
    showInstanceWhenRemote,
  });

  return (
    <LinkContainer
      {...bind()}
      className={cx(className, hideCommunity ? hideCss : undefined)}
    >
      <StyledLink
        to={buildGeneralBrowseLink(`/c/${handle}`)}
        onClick={(e) => {
          e.stopPropagation();
          preventOnClickNavigationBug(e);
        }}
      >
        {showCommunityIcons && !hideCommunity && (
          <StyledItemIcon item={community} size={tinyIcon ? 16 : 24} />
        )}

        {name}
        {!disableInstanceClick && instance}
      </StyledLink>
      {disableInstanceClick && instance}
    </LinkContainer>
  );
}

const onStart: LongPressOptions["onStart"] = (e) => {
  e.stopPropagation();
};
