import { getHandle } from "../../../helpers/lemmy";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { Community, SubscribedType } from "lemmy-js-client";
import Handle from "../Handle";
import { StyledLink } from "./shared";
import ItemIcon from "../img/ItemIcon";
import { css } from "@emotion/react";
import { useIonActionSheet } from "@ionic/react";
import { useLongPress } from "use-long-press";
import {
  heartDislikeOutline,
  heartOutline,
  removeCircleOutline,
  tabletPortraitOutline,
} from "ionicons/icons";
import useCommunityActions from "../../community/useCommunityActions";

interface CommunityLinkProps {
  community: Community;
  showInstanceWhenRemote?: boolean;
  subscribed: SubscribedType;

  className?: string;
}

export default function CommunityLink({
  community,
  showInstanceWhenRemote,
  className,
}: CommunityLinkProps) {
  const [present] = useIonActionSheet();

  const handle = getHandle(community);

  const { isSubscribed, isBlocked, subscribe, block, sidebar } =
    useCommunityActions(community);

  const bind = useLongPress(
    () => {
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
    },
    { cancelOnMovement: true },
  );

  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  return (
    <StyledLink
      to={buildGeneralBrowseLink(`/c/${getHandle(community, true)}`)}
      onClick={(e) => e.stopPropagation()}
      className={className}
      {...bind()}
    >
      <ItemIcon
        item={community}
        size={24}
        css={css`
          margin-right: 0.4rem;
          vertical-align: middle;
        `}
      />

      <Handle
        item={community}
        showInstanceWhenRemote={showInstanceWhenRemote}
      />
    </StyledLink>
  );
}
