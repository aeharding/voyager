import {
  IonActionSheet,
  IonButton,
  IonIcon,
  useIonModal,
  useIonRouter,
  useIonToast,
} from "@ionic/react";
import {
  createOutline,
  ellipsisHorizontal,
  heartDislikeOutline,
  heartOutline,
  tabletPortraitOutline,
} from "ionicons/icons";
import { useContext, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { followCommunity } from "./communitySlice";
import { PageContext } from "../auth/PageContext";
import Login from "../auth/Login";
import { isAdminSelector, jwtSelector } from "../auth/authSlice";
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
  const jwt = useAppSelector(jwtSelector);
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const site = useAppSelector((state) => state.auth.site);
  const isAdmin = useAppSelector(isAdminSelector);

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
            }
          }
        }}
      />
    </>
  );
}
