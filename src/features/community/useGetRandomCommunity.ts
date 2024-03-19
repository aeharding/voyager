import { useCallback } from "react";
import { clientSelector } from "../auth/authSelectors";
import store from "../../store";
import { useOptimizedIonRouter } from "../../helpers/useOptimizedIonRouter";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import { orderBy, sample } from "lodash";
import { getHandle } from "../../helpers/lemmy";
import { randomCommunityFailed } from "../../helpers/toastMessages";
import useAppToast from "../../helpers/useAppToast";
import { pageTransitionAnimateBackOnly } from "../../helpers/ionic";

const RANDOM_CHUNK = 20;

export default function useGetRandomCommunity() {
  const router = useOptimizedIonRouter();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();
  const presentToast = useAppToast();

  return useCallback(async () => {
    const totalCommunitiesCount =
      store.getState().site.response?.site_view.counts.communities;
    if (!totalCommunitiesCount) return;

    const client = clientSelector(store.getState());

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

    const randomCommunitiesByPosts = orderBy(
      response.communities,
      (c) => -c.counts.posts,
    );

    const eligibleRandomCommunities = randomCommunitiesByPosts.filter(
      (c) => c.counts.posts > 10,
    );
    const chosenRandomCommunity =
      sample(eligibleRandomCommunities)?.community ??
      randomCommunitiesByPosts[0]?.community;

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
  }, [buildGeneralBrowseLink, router, presentToast]);
}
