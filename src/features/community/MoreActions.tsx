import {
  IonActionSheet,
  IonButton,
  IonIcon,
  useIonRouter,
  useIonToast,
} from "@ionic/react";
import {
  createOutline,
  ellipsisHorizontal,
  heartDislikeOutline,
  heartOutline,
  starOutline,
  starSharp,
  tabletPortraitOutline,
} from "ionicons/icons";
import { useContext, useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  addFavorite,
  followCommunity,
  getFavoriteCommunities,
  removeFavorite,
} from "./communitySlice";
import { PageContext } from "../auth/PageContext";
import { jwtSelector } from "../auth/authSlice";
import { isAdminSelector } from "../auth/authSlice";
import { NewPostContext } from "../post/new/NewPostModal";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import { checkIsMod } from "../../helpers/lemmy";

interface MoreActionsProps {
  community: string;
}

export default function MoreActions({ community }: MoreActionsProps) {
  const [present] = useIonToast();
  const router = useIonRouter();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const site = useAppSelector((state) => state.auth.site);
  const isAdmin = useAppSelector(isAdminSelector);
  const jwt = useAppSelector(jwtSelector);

  const { presentLoginIfNeeded } = useContext(PageContext);

  const communityByHandle = useAppSelector(
    (state) => state.community.communityByHandle
  );

  const { presentNewPost } = useContext(NewPostContext);

  const isSubscribed =
    communityByHandle[community]?.community_view.subscribed === "Subscribed" ||
    communityByHandle[community]?.community_view.subscribed === "Pending";

  const favoriteCommunities = useAppSelector(
    (state) => state.community.favorites
  );

  const isFavorite = useMemo(
    () => favoriteCommunities.includes(community),
    [community, favoriteCommunities]
  );

  useEffect(() => {
    if (!jwt) return;

    dispatch(getFavoriteCommunities());
  }, [community, communityByHandle, dispatch, favoriteCommunities, jwt]);

  const canPost = useMemo(() => {
    const isMod = site ? checkIsMod(community, site) : false;

    const canPost =
      !communityByHandle[community]?.community_view.community
        .posting_restricted_to_mods ||
      isMod ||
      isAdmin;

    return canPost;
  }, [community, communityByHandle, isAdmin, site]);

  return (
    <>
      <IonButton
        disabled={!communityByHandle[community]}
        fill="default"
        onClick={() => setOpen(true)}
      >
        <IonIcon icon={ellipsisHorizontal} color="primary" />
      </IonButton>
      <IonActionSheet
        cssClass="left-align-buttons"
        isOpen={open}
        buttons={[
          {
            text: "Submit Post",
            role: "post",
            icon: createOutline,
          },
          {
            text: !isSubscribed ? "Subscribe" : "Unsubscribe",
            role: "subscribe",
            icon: !isSubscribed ? heartOutline : heartDislikeOutline,
          },
          {
            text: !isFavorite ? "Favorite" : "Unfavorite",
            role: "favorite",
            icon: !isFavorite ? starOutline : starSharp,
          },
          {
            text: "Sidebar",
            role: "sidebar",
            icon: tabletPortraitOutline,
          },
          {
            text: "Cancel",
            role: "cancel",
          },
        ]}
        onWillDismiss={async (e) => {
          setOpen(false);

          switch (e.detail.role) {
            case "subscribe": {
              if (presentLoginIfNeeded()) return;

              try {
                await dispatch(followCommunity(!isSubscribed, community));
              } catch (error) {
                present({
                  message: `Problem ${
                    isSubscribed ? "unsubscribing from" : "subscribing to"
                  } c/${community}. Please try again.`,
                  duration: 3500,
                  position: "bottom",
                  color: "danger",
                });
                throw error;
              }

              present({
                message: `${
                  isSubscribed ? "Unsubscribed from" : "Subscribed to"
                } c/${community}.`,
                duration: 3500,
                position: "bottom",
                color: "success",
              });
              break;
            }
            case "post": {
              if (presentLoginIfNeeded()) return;

              if (!canPost) {
                present({
                  message: "This community has disabled new posts",
                  duration: 3500,
                  position: "bottom",
                  color: "warning",
                });
                return;
              }

              presentNewPost();
              break;
            }
            case "favorite": {
              if (!isFavorite) {
                dispatch(addFavorite(community));
              } else {
                dispatch(removeFavorite(community));
              }

              present({
                message: `${
                  isFavorite ? "Unfavorited" : "Favorited"
                } c/${community}.`,
                duration: 3500,
                position: "bottom",
                color: "success",
              });

              break;
            }
            case "sidebar": {
              router.push(buildGeneralBrowseLink(`/c/${community}/sidebar`));
            }
          }
        }}
      />
    </>
  );
}
