import { CommunityView } from "lemmy-js-client";
import { useContext } from "react";
import { PageContext } from "../auth/PageContext";
import { useAppDispatch, useAppSelector } from "../../store";
import { checkIsMod, getHandle } from "../../helpers/lemmy";
import { useIonActionSheet, useIonRouter, useIonToast } from "@ionic/react";
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

export default function useCommunityActions(community: CommunityView) {
  const [present] = useIonToast();
  const dispatch = useAppDispatch();
  const communityHandle = getHandle(community.community);
  const router = useIonRouter();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  const site = useAppSelector((state) => state.auth.site);
  const isMod = site ? checkIsMod(communityHandle, site) : false;
  const isAdmin = useAppSelector(isAdminSelector);
  const isSubscribed =
    community?.subscribed === "Subscribed" ||
    community?.subscribed === "Pending";
  const { presentLoginIfNeeded } = useContext(PageContext);
  const { presentPostEditor } = useContext(PageContext);
  const isBlocked = community?.blocked;
  const communityId = community?.community.id;
  const localUser = useAppSelector(localUserSelector);
  const [presentActionSheet] = useIonActionSheet();

  const canPost =
    !community?.community.posting_restricted_to_mods || isMod || isAdmin;

  const favoriteCommunities = useAppSelector(
    (state) => state.community.favorites,
  );

  const isFavorite = favoriteCommunities.includes(communityHandle);

  function post() {
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

    presentPostEditor(communityHandle);
  }

  async function subscribe() {
    if (presentLoginIfNeeded()) return;

    const communityId = community?.community.id;

    if (communityId === undefined) throw new Error("community not found");

    try {
      await dispatch(followCommunity(!isSubscribed, communityId));
    } catch (error) {
      present(buildProblemSubscribing(isSubscribed, communityHandle));
      throw error;
    }

    present(buildSuccessSubscribing(isSubscribed, communityHandle));
  }

  function favorite() {
    if (presentLoginIfNeeded()) return;

    if (!isFavorite) {
      dispatch(addFavorite(communityHandle));
    } else {
      dispatch(removeFavorite(communityHandle));
    }

    present({
      message: `${
        isFavorite ? "Unfavorited" : "Favorited"
      } c/${communityHandle}.`,
      duration: 3500,
      position: "bottom",
      color: "success",
    });
  }

  async function block() {
    if (typeof communityId !== "number") return;

    if (
      !community?.blocked &&
      community?.community.nsfw &&
      localUser?.show_nsfw
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

                present(allNSFWHidden);
              })();
            },
          },
          {
            text: "Only this community",
            role: "destructive",
            handler: () => {
              (async () => {
                await dispatch(blockCommunity(!isBlocked, communityId));

                present(buildBlocked(!isBlocked, communityHandle));
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

      present(buildBlocked(!isBlocked, communityHandle));
    }
  }

  function sidebar() {
    router.push(buildGeneralBrowseLink(`/c/${communityHandle}/sidebar`));
  }

  function view() {
    router.push(buildGeneralBrowseLink(`/c/${communityHandle}`));
  }

  return {
    isSubscribed,
    isFavorite,
    isBlocked,
    post,
    subscribe,
    favorite,
    block,
    sidebar,
    view,
  };
}
