import { getHandle } from "../../../helpers/lemmy";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { Community } from "lemmy-js-client";
import Handle from "../Handle";
import { StyledLink } from "./shared";
import ItemIcon from "../img/ItemIcon";
import { css } from "@emotion/react";
import { useAppDispatch } from "../../../store";
import { useIonActionSheet, useIonToast } from "@ionic/react";
import { useLongPress } from "use-long-press";
import { blockCommunity } from "../../community/communitySlice";
import { buildBlocked } from "../../../helpers/toastMessages";

interface CommunityLinkProps {
  community: Community;
  showInstanceWhenRemote?: boolean;

  className?: string;
}

export default function CommunityLink({
  community,
  showInstanceWhenRemote,
  className,
}: CommunityLinkProps) {
  const dispatch = useAppDispatch();
  const [present] = useIonActionSheet();
  const [presentToast] = useIonToast();

  const bind = useLongPress(
    () => {
      present([
        {
          text: "Block Community",
          role: "destructive",
          handler: () => {
            (async () => {
              await dispatch(blockCommunity(true, community.id));

              presentToast(buildBlocked(true, getHandle(community)));
            })();
          },
        },
        {
          text: "Cancel",
          role: "cancel",
        },
      ]);
    },
    { cancelOnMovement: true }
  );

  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  return (
    <StyledLink
      to={buildGeneralBrowseLink(`/c/${getHandle(community)}`)}
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
