import { IonItem } from "@ionic/react";
import { Community } from "lemmy-js-client";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { useAppDispatch, useAppSelector } from "../../../store";
import { useMemo } from "react";
import { getHandle } from "../../../helpers/lemmy";
import { Content } from "./ResolvedCommunitiesList";
import ItemIcon from "../../labels/img/ItemIcon";
import { ActionButton } from "../../post/actions/ActionButton";
import { addFavorite, removeFavorite } from "../communitySlice";
import { star } from "ionicons/icons";
import { ToggleIcon } from "../ToggleIcon";
import styled from "@emotion/styled";
import { HIDE_ALPHABET_JUMP } from "./AlphabetJump";
import { loggedInSelector } from "../../auth/authSelectors";
import { attributedPreventOnClickNavigationBug } from "../../../helpers/ionic";

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
  community: Community | string;
  favorites?: string[];
}) {
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const dispatch = useAppDispatch();

  const loggedIn = useAppSelector(loggedInSelector);

  const handle =
    typeof community === "string" ? community : getHandle(community);

  const isFavorite = useMemo(
    () => favorites?.includes(handle) ?? false,
    [favorites, handle],
  );

  return (
    <IonItem
      routerLink={buildGeneralBrowseLink(`/c/${handle}`)}
      detail={false}
      {...attributedPreventOnClickNavigationBug}
    >
      <Content>
        <ItemIcon item={community} size={28} />
        {handle}
      </Content>
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
          <StyledToggleIcon icon={star} selected={isFavorite} />
        </ActionButton>
      )}
    </IonItem>
  );
}
