import { useIonActionSheet, useIonRouter, useIonToast } from "@ionic/react";
import { useAppDispatch, useAppSelector } from "../../store";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import {
  isAdminSelector,
  localUserSelector,
  showNsfw,
} from "../auth/authSlice";
import { useContext, useMemo } from "react";
import { PageContext } from "../auth/PageContext";
import { checkIsMod } from "../../helpers/lemmy";
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

function useCommunityActions(community: string) {
  const [present] = useIonToast();
  const router = useIonRouter();
  const dispatch = useAppDispatch();
  //   const [open, setOpen] = useState(false);
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const site = useAppSelector((state) => state.auth.site);
  const isAdmin = useAppSelector(isAdminSelector);
  const localUser = useAppSelector(localUserSelector);
  const [presentActionSheet] = useIonActionSheet();
  const { presentPostEditor } = useContext(PageContext);

  //   const hidePosts = useHidePosts();

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

    presentPostEditor(community);
  }

  async function subscribe() {
    if (presentLoginIfNeeded()) return;

    const communityId = communityByHandle[community]?.community.id;

    if (communityId === undefined) throw new Error("community not found");

    try {
      await dispatch(followCommunity(!isSubscribed, communityId));
    } catch (error) {
      present(buildProblemSubscribing(isSubscribed, community));
      throw error;
    }

    present(buildSuccessSubscribing(isSubscribed, community));
  }

  function favorite() {
    if (presentLoginIfNeeded()) return;

    if (!isFavorite) {
      dispatch(addFavorite(community));
    } else {
      dispatch(removeFavorite(community));
    }

    present({
      message: `${isFavorite ? "Unfavorited" : "Favorited"} c/${community}.`,
      duration: 3500,
      position: "bottom",
      color: "success",
    });
  }

  function sidebar() {
    router.push(buildGeneralBrowseLink(`/c/${community}/sidebar`));
  }

  async function block() {
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

  return {
    communityByHandle,
    isSubscribed,
    isFavorite,
    isBlocked,
    post,
    subscribe,
    favorite,
    sidebar,
    block,
  };
}

export default useCommunityActions;
