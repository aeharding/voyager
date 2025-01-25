import { useIonActionSheet } from "@ionic/react";
import { Community, SubscribedType } from "lemmy-js-client";
import { useContext } from "react";

import { PageContext } from "#/features/auth/PageContext";
import {
  isAdminSelector,
  localUserSelector,
  showNsfw,
} from "#/features/auth/siteSlice";
import { checkIsMod, getHandle as useGetHandle } from "#/helpers/lemmy";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import { shareUrl } from "#/helpers/share";
import {
  allNSFWHidden,
  buildBlockedCommunity,
  buildFavorited,
  buildProblemSubscribing,
  buildSuccessSubscribing,
} from "#/helpers/toastMessages";
import useAppToast from "#/helpers/useAppToast";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";
import { db } from "#/services/db";
import { useAppDispatch, useAppSelector } from "#/store";

import {
  addFavorite,
  blockCommunity,
  followCommunity,
  removeFavorite,
} from "./communitySlice";

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

  // useGetHandle as signal to react compiler to optimize
  const communityHandle = useGetHandle(community);

  const subscribedSourceOfTruth = useAppSelector((state) =>
    state.community.communityByHandle[communityHandle]
      ? state.community.communityByHandle[communityHandle]?.subscribed
      : subscribedFromPayload,
  );
  const router = useOptimizedIonRouter();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const [presentActionSheet] = useIonActionSheet();

  const { presentLoginIfNeeded } = useContext(PageContext);
  const { presentPostEditor } = useContext(PageContext);

  const site = useAppSelector((state) => state.site.response);
  const isAdmin = useAppSelector(isAdminSelector);
  const localUser = useAppSelector(localUserSelector);

  const communityId = community.id;
  const isNsfw = community.nsfw;

  const isSubscribed =
    subscribedSourceOfTruth === "Subscribed" ||
    subscribedSourceOfTruth === "Pending";

  const isBlocked = useAppSelector(
    (state) => state.community.communityByHandle[communityHandle]?.blocked,
  );

  const canPost = (() => {
    const isMod = site ? checkIsMod(communityHandle, site) : false;

    return !community.posting_restricted_to_mods || isMod || isAdmin;
  })();

  const favoriteCommunities = useAppSelector(
    (state) => state.community.favorites,
  );

  const isFavorite = favoriteCommunities.includes(communityHandle);

  const post = () => {
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
  };

  const subscribe = async () => {
    if (presentLoginIfNeeded()) return;

    try {
      await dispatch(followCommunity(!isSubscribed, communityId));
      presentToast(buildSuccessSubscribing(isSubscribed));
    } catch (error) {
      presentToast(buildProblemSubscribing(isSubscribed));
      throw error;
    }
  };

  const favorite = () => {
    if (presentLoginIfNeeded()) return;

    if (!isFavorite) {
      dispatch(addFavorite(communityHandle));
    } else {
      dispatch(removeFavorite(communityHandle));
    }

    presentToast(buildFavorited(isFavorite));
  };

  const block = async () => {
    if (typeof communityId !== "number") return;

    async function _block() {
      await dispatch(blockCommunity(!isBlocked, communityId));
    }

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
                presentToast(buildBlockedCommunity(!isBlocked));
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
      presentToast(buildBlockedCommunity(!isBlocked));
    }
  };

  const modlog = () => {
    router.push(buildGeneralBrowseLink(`/c/${communityHandle}/log`));
  };

  const sidebar = () => {
    router.push(buildGeneralBrowseLink(`/c/${communityHandle}/sidebar`));
  };

  const view = () => {
    router.push(buildGeneralBrowseLink(`/c/${communityHandle}`));
  };

  const share = () => {
    shareUrl(community.actor_id);
  };

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
