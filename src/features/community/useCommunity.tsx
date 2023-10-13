import { useIonActionSheet, useIonRouter, useIonToast } from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../store";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import {
  isAdminSelector,
  localUserSelector,
  showNsfw,
} from "../auth/authSlice";
import { useContext, useEffect } from "react";
import { PageContext } from "../auth/PageContext";
import { checkIsMod } from "../../helpers/lemmy";
import {
  addFavorite,
  blockCommunity,
  followCommunity,
  getCommunity,
  removeFavorite,
} from "./communitySlice";
import {
  allNSFWHidden,
  buildBlocked,
  buildProblemSubscribing,
  buildSuccessSubscribing,
} from "../../helpers/toastMessages";

// fetches the community info (subscribed, etc) from the server
export default function useCommunity(communityHandle: string) {
  const [present] = useIonToast();
  const router = useIonRouter();
  const dispatch = useAppDispatch();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const site = useAppSelector((state) => state.auth.site);
  const isAdmin = useAppSelector(isAdminSelector);
  const localUser = useAppSelector(localUserSelector);
  const [presentActionSheet] = useIonActionSheet();
  const { presentPostEditor } = useContext(PageContext);

  const { presentLoginIfNeeded } = useContext(PageContext);

  const communityByHandle = useAppSelector(
    (state) => state.community.communityByHandle,
  );

  useEffect(() => {
    if (communityByHandle[communityHandle]) return;

    dispatch(getCommunity(communityHandle));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityHandle]);

  const isSubscribed =
    communityByHandle[communityHandle]?.subscribed === "Subscribed" ||
    communityByHandle[communityHandle]?.subscribed === "Pending";

  const isBlocked = communityByHandle[communityHandle]?.blocked;
  const communityId = communityByHandle[communityHandle]?.community.id;

  const favoriteCommunities = useAppSelector(
    (state) => state.community.favorites,
  );

  const isFavorite = favoriteCommunities.includes(communityHandle);

  const isMod = site ? checkIsMod(communityHandle, site) : false;

  const canPost =
    !communityByHandle[communityHandle]?.community.posting_restricted_to_mods ||
    isMod ||
    isAdmin;

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

    const communityId = communityByHandle[communityHandle]?.community.id;

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

  function sidebar() {
    router.push(buildGeneralBrowseLink(`/c/${communityHandle}/sidebar`));
  }

  function view() {
    router.push(buildGeneralBrowseLink(`/c/${communityHandle}`));
  }

  async function block() {
    if (typeof communityId !== "number") return;

    if (
      !communityByHandle[communityHandle]?.blocked &&
      communityByHandle[communityHandle]?.community.nsfw &&
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

  return {
    communityByHandle,
    isSubscribed,
    isFavorite,
    isBlocked,
    post,
    subscribe,
    favorite,
    sidebar,
    view,
    block,
  };
}
