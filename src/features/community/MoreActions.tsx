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
  removeCircleOutline,
  tabletPortraitOutline,
} from "ionicons/icons";
import { useContext, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { blockCommunity, followCommunity } from "./communitySlice";
import {
  isAdminSelector,
  localUserSelector,
  showNsfw,
} from "../auth/authSlice";
import { NewPostContext } from "../post/new/NewPostModal";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import { checkIsMod } from "../../helpers/lemmy";
import { PageContext } from "../auth/PageContext";
import { allNSFWHidden, buildBlocked } from "../../helpers/toastMessages";

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

  const { presentLoginIfNeeded } = useContext(PageContext);

  const communityByHandle = useAppSelector(
    (state) => state.community.communityByHandle
  );

  const { presentNewPost } = useContext(NewPostContext);

  const isSubscribed =
    communityByHandle[community]?.subscribed === "Subscribed" ||
    communityByHandle[community]?.subscribed === "Pending";

  const isBlocked = communityByHandle[community]?.blocked;
  const communityId = communityByHandle[community]?.community.id;

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
            text: !isSubscribed ? "Subscribe" : "Unsubscribe",
            data: "subscribe",
            icon: !isSubscribed ? heartOutline : heartDislikeOutline,
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
        onWillDismiss={async (e) => {
          setOpen(false);

          switch (e.detail.data) {
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
