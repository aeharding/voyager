import {
  IonActionSheet,
  IonButton,
  IonIcon,
  useIonModal,
  useIonToast,
} from "@ionic/react";
import {
  createOutline,
  ellipsisHorizontal,
  heartDislikeOutline,
  heartOutline,
  starOutline,
  starSharp,
} from "ionicons/icons";
import { useContext, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  followCommunity,
  getFavouriteCommunities,
  updateFavouriteCommunities,
} from "./communitySlice";
import { PageContext } from "../auth/PageContext";
import Login from "../auth/Login";
import { jwtSelector } from "../auth/authSlice";
import { NewPostContext } from "../post/new/NewPostModal";

interface MoreActionsProps {
  community: string;
}

export default function MoreActions({ community }: MoreActionsProps) {
  const [present] = useIonToast();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const jwt = useAppSelector(jwtSelector);

  const pageContext = useContext(PageContext);
  const [login, onDismissLogin] = useIonModal(Login, {
    onDismiss: (data: string, role: string) => onDismissLogin(data, role),
  });

  const communityByHandle = useAppSelector(
    (state) => state.community.communityByHandle
  );

  const { presentNewPost } = useContext(NewPostContext);

  const isSubscribed =
    communityByHandle[community]?.community_view.subscribed === "Subscribed" ||
    communityByHandle[community]?.community_view.subscribed === "Pending";

  const [isFavourite, setIsFavourite] = useState(false);

  const favouriteCommunities = useAppSelector(
    (state) => state.community.favouriteCommunities
  );

  useEffect(() => {
    if (!jwt) return;

    dispatch(getFavouriteCommunities());
  }, [dispatch, jwt]);

  useEffect(() => {
    if (!jwt) return;

    setIsFavourite(
      (favouriteCommunities || []).some(
        (favouriteCommunity) => favouriteCommunity.actorId === community
      )
    );

    return () => setIsFavourite(false);
  }, [community, communityByHandle, favouriteCommunities, jwt]);

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
            text: !isFavourite ? "Favourite" : "Unfavourite",
            role: "favourite",
            icon: !isFavourite ? starOutline : starSharp,
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
              if (!jwt) return login({ presentingElement: pageContext.page });

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
              if (!jwt) return login({ presentingElement: pageContext.page });

              presentNewPost();
              break;
            }
            case "favourite": {
              const communityFromState = communityByHandle[community];

              if (!communityFromState) {
                return;
              }

              const currentCommunity =
                communityFromState.community_view.community;

              if (!currentCommunity.id) {
                return;
              }

              try {
                // add to favouriteCommunities if not already there
                if (!isFavourite) {
                  dispatch(
                    updateFavouriteCommunities([
                      ...(favouriteCommunities || []),
                      {
                        actorId: community,
                        id: currentCommunity.id,
                      },
                    ])
                  );
                } else {
                  dispatch(
                    updateFavouriteCommunities(
                      (favouriteCommunities || []).filter(
                        (favouriteCommunity) =>
                          favouriteCommunity.actorId !== community
                      )
                    )
                  );
                }
              } catch (error) {
                present({
                  message: `Problem ${
                    isFavourite ? "unfavouriting" : "favouriting"
                  } c/${community}. Please try again.`,
                  duration: 3500,
                  position: "bottom",
                  color: "danger",
                });
                throw error;
              }

              present({
                message: `${
                  isFavourite ? "Unfavourited" : "Favourited"
                } c/${community}.`,
                duration: 3500,
                position: "bottom",
                color: "success",
              });

              break;
            }
          }
        }}
      />
    </>
  );
}
