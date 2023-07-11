import styled from "@emotion/styled";
import { IonIcon, IonItem } from "@ionic/react";
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
import { css } from "@emotion/react";

const StarIcon = styled(IonIcon)<{ selected: boolean }>`
  font-size: 24px;

  ${({ selected }) =>
    selected
      ? css`
          color: var(--ion-color-primary);
        `
      : css`
          opacity: 0.08;
        `}
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
    [favorites, community]
  );

  return (
    <IonItem
      key={community.id}
      routerLink={buildGeneralBrowseLink(`/c/${getHandle(community)}`)}
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
        <StarIcon icon={star} selected={isFavorite} />
      </ActionButton>
    </IonItem>
  );
}
