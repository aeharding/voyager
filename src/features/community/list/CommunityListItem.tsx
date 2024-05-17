import {
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
} from "@ionic/react";
import { Community } from "lemmy-js-client";
import { useBuildGeneralBrowseLink } from "../../../helpers/routes";
import { useAppDispatch, useAppSelector } from "../../../store";
import { useMemo } from "react";
import { getHandle } from "../../../helpers/lemmy";
import { Content } from "./ResolvedCommunitiesList";
import ItemIcon from "../../labels/img/ItemIcon";
import { ActionButton } from "../../post/actions/ActionButton";
import {
  addFavorite,
  followCommunity,
  removeFavorite,
} from "../communitySlice";
import { star } from "ionicons/icons";
import { ToggleIcon } from "../ToggleIcon";
import { HIDE_ALPHABET_JUMP } from "./AlphabetJump";
import { loggedInSelector } from "../../auth/authSelectors";
import { attributedPreventOnClickNavigationBug } from "../../../helpers/ionic";
import { styled } from "@linaria/react";
import useAppToast from "../../../helpers/useAppToast";
import {
  buildFavorited,
  buildProblemSubscribing,
  buildSuccessSubscribing,
} from "../../../helpers/toastMessages";

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
  removeAction,
}: {
  community: Community | string;
  favorites?: string[];
  removeAction: "follow" | "favorite" | "none";
}) {
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
      presentToast(buildSuccessSubscribing(true, getHandle(community)));
    } catch (error) {
      presentToast(buildProblemSubscribing(true, getHandle(community)));
      throw error;
    }
  }

  function unfavorite() {
    const communityHandle =
      typeof community === "string" ? community : getHandle(community);

    dispatch(removeFavorite(communityHandle));

    presentToast(buildFavorited(isFavorite, communityHandle));
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

      {slideActions}
    </IonItemSliding>
  );
}
