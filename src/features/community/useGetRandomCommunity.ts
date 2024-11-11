import { sample, sortBy } from "es-toolkit";

import { clientSelector } from "#/features/auth/authSelectors";
import { pageTransitionAnimateBackOnly } from "#/helpers/ionic";
import { getHandle } from "#/helpers/lemmy";
import { useBuildGeneralBrowseLink } from "#/helpers/routes";
import { randomCommunityFailed } from "#/helpers/toastMessages";
import useAppToast from "#/helpers/useAppToast";
import { useOptimizedIonRouter } from "#/helpers/useOptimizedIonRouter";
import useSupported from "#/helpers/useSupported";
import store from "#/store";

const RANDOM_CHUNK = 20;

export default function useGetRandomCommunity() {
  const router = useOptimizedIonRouter();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const presentToast = useAppToast();
  const randomCommunityApiSupport = useSupported("Random community API");

  return async () => {
    let chosenRandomCommunity;
    const client = clientSelector(store.getState());

    if (randomCommunityApiSupport) {
      let response;

      try {
        response = await client.getRandomCommunity({ type_: "All" });
      } catch (error) {
        presentToast(randomCommunityFailed);
        throw error;
      }

      chosenRandomCommunity = response.community_view.community;
    } else {
      const totalCommunitiesCount =
        store.getState().site.response?.site_view.counts.communities;
      if (!totalCommunitiesCount) return;

      let response;

      try {
        response = await client.listCommunities({
          type_: "All",
          limit: RANDOM_CHUNK,
          page: Math.floor(
            (Math.random() * totalCommunitiesCount) / RANDOM_CHUNK,
          ),
        });
      } catch (error) {
        presentToast(randomCommunityFailed);

        throw error;
      }

      const randomCommunitiesByPosts = sortBy(response.communities, [
        (c) => -c.counts.posts,
      ]);

      const eligibleRandomCommunities = randomCommunitiesByPosts.filter(
        (c) => c.counts.posts > 10,
      );

      chosenRandomCommunity =
        sample(eligibleRandomCommunities)?.community ??
        randomCommunitiesByPosts[0]?.community;
    }

    if (!chosenRandomCommunity) {
      presentToast(randomCommunityFailed);
      return;
    }

    router.push(
      buildGeneralBrowseLink(`/c/${getHandle(chosenRandomCommunity)}?random=1`),
      "forward",
      "replace",
      undefined,
      pageTransitionAnimateBackOnly,
    );

    return true;
  };
}
