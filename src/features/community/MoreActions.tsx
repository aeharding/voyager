import {
  IonActionSheet,
  IonButton,
  IonIcon,
  useIonActionSheet,
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
  removeCircleOutline,
  tabletPortraitOutline,
  eyeOffOutline,
} from "ionicons/icons";
import { useContext, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  addFavorite,
  blockCommunity,
  followCommunity,
  removeFavorite,
} from "./communitySlice";
import {
  isAdminSelector,
  localUserSelector,
  showNsfw,
} from "../auth/authSlice";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import { checkIsMod } from "../../helpers/lemmy";
import { PageContext } from "../auth/PageContext";
import {
  allNSFWHidden,
  buildBlocked,
  buildProblemSubscribing,
  buildSuccessSubscribing,
} from "../../helpers/toastMessages";
import useHidePosts from "../feed/useHidePosts";

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
  const localUser = useAppSelector(localUserSelector);
  const [presentActionSheet] = useIonActionSheet();
  const { presentPostEditor } = useContext(PageContext);

  const hidePosts = useHidePosts();

  const { presentLoginIfNeeded } = useContext(PageContext);

  const communityByHandle = useAppSelector(
    (state) => state.community.communityByHandle
  );

  const isSubscribed =
    communityByHandle[community]?.subscribed === "Subscribed" ||
    communityByHandle[community]?.subscribed === "Pending";

  const isBlocked = communityByHandle[community]?.blocked;
  const communityId = communityByHandle[community]?.community.id;

  const favoriteCommunities = useAppSelector(
    (state) => state.community.favorites
  );

  const isFavorite = useMemo(
    () => favoriteCommunities.includes(community),
    [community, favoriteCommunities]
  );

  const canPost = useMemo(() => {
    const isMod = site ? checkIsMod(community, site) : false;

    const canPost =
      !communityByHandle[community]?.community.posting_restricted_to_mods ||
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
            data: "post",
            icon: createOutline,
          },
          {
            text: "Hide Read Posts",
            data: "hide-read",
            icon: eyeOffOutline,
          },
          {
            text: !isSubscribed ? "Subscribe" : "Unsubscribe",
            data: "subscribe",
            icon: !isSubscribed ? heartOutline : heartDislikeOutline,
          },
          {
            text: !isFavorite ? "Favorite" : "Unfavorite",
            data: "favorite",
            icon: !isFavorite ? starOutline : starSharp,
          },
          {
            text: "Sidebar",
            data: "sidebar",
            icon: tabletPortraitOutline,
          },
          {
            text: !isBlocked ? "Block Community" : "Unblock Community",
            role: !isBlocked ? "destructive" : undefined,
            data: "block",
            icon: removeCircleOutline,
          },
          {
            text: "Cancel",
            role: "cancel",
          },
        ]}
        onDidDismiss={() => setOpen(false)}
        onWillDismiss={async (e) => {
          switch (e.detail.data) {
            case "subscribe": {
              if (presentLoginIfNeeded()) return;

              const communityId = communityByHandle[community]?.community.id;

              if (communityId === undefined)
                throw new Error("community not found");

              try {
                await dispatch(followCommunity(!isSubscribed, communityId));
              } catch (error) {
                present(buildProblemSubscribing(isSubscribed, community));
                throw error;
              }

              present(buildSuccessSubscribing(isSubscribed, community));
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

              presentPostEditor(community);
              break;
            }
            case "hide-read": {
              hidePosts();
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
              break;
            }
            case "block": {
              if (typeof communityId !== "number") return;

              if (
                !communityByHandle[community]?.blocked &&
                communityByHandle[community]?.community.nsfw &&
                localUser?.show_nsfw
              ) {
                // User wants to block a NSFW community when account is set to show NSFW. Ask them
                // if they want to hide all NSFW instead of blocking on a per community basis
                presentActionSheet({
                  header: "Block everything NSFW?",
                  subHeader:
                    "Your choice will only affect your current account",
                  cssClass: "left-align-buttons",
                  buttons: [
                    {
                      text: "Block everything NSFW",
                      role: "destructive",
                      handler: () => {
                        (async () => {
                          await dispatch(showNsfw(false));

                          present(allNSFWHidden);
                        })();
                      },
                    },
                    {
                      text: "Only this community",
                      role: "destructive",
                      handler: () => {
                        (async () => {
                          await dispatch(
                            blockCommunity(!isBlocked, communityId)
                          );

                          present(buildBlocked(!isBlocked, community));
                        })();
                      },
                    },
                    {
                      text: "Cancel",
                      role: "cancel",
                    },
                  ],
                });
              } else {
                await dispatch(blockCommunity(!isBlocked, communityId));

                present(buildBlocked(!isBlocked, community));
              }
            }
          }
        }}
      />
    </>
  );
}
