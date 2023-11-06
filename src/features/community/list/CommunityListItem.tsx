import { IonItem } from "@ionic/react";
import { Community } from "lemmy-js-client";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { useAppDispatch } from "../../../store";
import { useMemo } from "react";
import { getHandle } from "../../../helpers/lemmy";
import { Content } from "./CommunitiesList";
import ItemIcon from "../../labels/img/ItemIcon";
import { ActionButton } from "../../post/actions/ActionButton";
import { addFavorite, removeFavorite } from "../communitySlice";
import { star } from "ionicons/icons";
import { ToggleIcon } from "../ToggleIcon";
import styled from "@emotion/styled";
import { HIDE_ALPHABET_JUMP } from "./AlphabetJump";

const StyledToggleIcon = styled(ToggleIcon)`
  @media (max-width: 725px) {
    margin-right: 8px;
  }

  @media ${HIDE_ALPHABET_JUMP} {
    margin-right: 0;
  }
`;

export default function CommunityListItem({
  community,
  favorites,
}: {
  community: Community;
  favorites?: string[];
}) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const dispatch = useAppDispatch();

  const isFavorite = useMemo(
    () => favorites?.includes(getHandle(community)) ?? false,
    [favorites, community],
  );

  return (
    <IonItem
      key={community.id}
      routerLink={buildGeneralBrowseLink(`/c/${getHandle(community)}`)}
      detail={false}
    >
      <Content>
        <ItemIcon item={community} size={28} />
        {getHandle(community)}
      </Content>
      <ActionButton
        slot="end"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();

          const handle = getHandle(community);

          if (!isFavorite) {
            dispatch(addFavorite(handle));
          } else {
            dispatch(removeFavorite(handle));
          }
        }}
      >
        <StyledToggleIcon icon={star} selected={isFavorite} />
      </ActionButton>
    </IonItem>
  );
}
