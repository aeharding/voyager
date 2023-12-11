import { Community, SubscribedType } from "lemmy-js-client";
import { useContext, useMemo } from "react";
import { PageContext } from "../auth/PageContext";
import { useAppDispatch, useAppSelector } from "../../store";
import { checkIsMod, getHandle } from "../../helpers/lemmy";
import { useIonActionSheet } from "@ionic/react";
import {
  isAdminSelector,
  localUserSelector,
  showNsfw,
} from "../auth/authSlice";
import {
  addFavorite,
  blockCommunity,
  followCommunity,
  removeFavorite,
} from "./communitySlice";
import {
  allNSFWHidden,
  buildBlocked,
  buildProblemSubscribing,
  buildSuccessSubscribing,
} from "../../helpers/toastMessages";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import useAppToast from "../../helpers/useAppToast";
import { db } from "../../services/db";
import { Share } from "@capacitor/share";
import { useOptimizedIonRouter } from "../../helpers/useOptimizedIonRouter";

/**
 *
 * @param community The community to show actions for
 * @param subscribedFromPayload Subscribed status from post payload. Will be used if `CommunityView` not yet hydrated in redux.
 * @returns Various community actions
 */
export default function useCommunityActions(
  community: Community,
  subscribedFromPayload?: SubscribedType,
) {
  const presentToast = useAppToast();

  const dispatch = useAppDispatch();
  const communityByHandle = useAppSelector(
    (state) => state.community.communityByHandle,
  );
  const router = useOptimizedIonRouter();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const [presentActionSheet] = useIonActionSheet();

  const { presentLoginIfNeeded } = useContext(PageContext);
  const { presentPostEditor } = useContext(PageContext);

  const site = useAppSelector((state) => state.auth.site);
  const isAdmin = useAppSelector(isAdminSelector);
  const localUser = useAppSelector(localUserSelector);

  const communityHandle = getHandle(community);
  const communityId = community.id;
  const isNsfw = community.nsfw;

  const subscribedSourceOfTruth = communityByHandle[communityHandle]
    ? communityByHandle[communityHandle]?.subscribed
    : subscribedFromPayload;

  const isSubscribed =
    subscribedSourceOfTruth === "Subscribed" ||
    subscribedSourceOfTruth === "Pending";

  const isBlocked = communityByHandle[communityHandle]?.blocked;

  const canPost = useMemo(() => {
    const isMod = site ? checkIsMod(communityHandle, site) : false;

    const canPost = !community.posting_restricted_to_mods || isMod || isAdmin;

    return canPost;
  }, [community, communityHandle, isAdmin, site]);

  const favoriteCommunities = useAppSelector(
    (state) => state.community.favorites,
  );

  const isFavorite = useMemo(
    () => favoriteCommunities.includes(communityHandle),
    [favoriteCommunities, communityHandle],
  );

  function post() {
    if (presentLoginIfNeeded()) return;

    if (!canPost) {
      presentToast({
        message: "This community has disabled new posts",
        position: "bottom",
        color: "warning",
      });
      return;
    }

    presentPostEditor(communityHandle);
  }

  async function _block() {
    await dispatch(blockCommunity(!isBlocked, communityId));
  }

  async function subscribe() {
    if (presentLoginIfNeeded()) return;

    try {
      await dispatch(followCommunity(!isSubscribed, communityId));
      presentToast(buildSuccessSubscribing(isSubscribed, communityHandle));
    } catch (error) {
      presentToast(buildProblemSubscribing(isSubscribed, communityHandle));
      throw error;
    }
  }

  function favorite() {
    if (presentLoginIfNeeded()) return;

    if (!isFavorite) {
      dispatch(addFavorite(communityHandle));
    } else {
      dispatch(removeFavorite(communityHandle));
    }

    presentToast({
      message: `${
        isFavorite ? "Unfavorited" : "Favorited"
      } c/${communityHandle}.`,
      position: "bottom",
      color: "success",
    });
  }

  async function block() {
    if (typeof communityId !== "number") return;

    if (
      !isBlocked &&
      isNsfw &&
      localUser?.show_nsfw &&
      !(await db.getSetting("has_presented_block_nsfw_tip"))
    ) {
      // User wants to block a NSFW community when account is set to show NSFW. Ask them
      // if they want to hide all NSFW instead of blocking on a per community basis
      presentActionSheet({
        header: "Block everything NSFW?",
        subHeader: "Your choice will only affect your current account",
        cssClass: "left-align-buttons",
        buttons: [
          {
            text: "Block everything NSFW",
            role: "destructive",
            handler: () => {
              (async () => {
                await dispatch(showNsfw(false));

                presentToast(allNSFWHidden);
              })();
            },
          },
          {
            text: "Only this community",
            role: "destructive",
            handler: () => {
              (async () => {
                await _block();
                presentToast(buildBlocked(!isBlocked, communityHandle));
              })();
            },
          },
          {
            text: "Cancel",
            role: "cancel",
          },
        ],
      });

      db.setSetting("has_presented_block_nsfw_tip", true);
    } else {
      await _block();
      presentToast(buildBlocked(!isBlocked, communityHandle));
    }
  }

  function modlog() {
    router.push(buildGeneralBrowseLink(`/c/${communityHandle}/log`));
  }

  function sidebar() {
    router.push(buildGeneralBrowseLink(`/c/${communityHandle}/sidebar`));
  }

  function view() {
    router.push(buildGeneralBrowseLink(`/c/${communityHandle}`));
  }

  function share() {
    Share.share({ url: community.actor_id });
  }

  return {
    isSubscribed,
    isBlocked,
    isFavorite,
    post,
    subscribe,
    favorite,
    block,
    modlog,
    sidebar,
    view,
    share,
  };
}
