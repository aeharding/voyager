import { useCallback } from "react";
import { clientSelector } from "../auth/authSelectors";
import store from "../../store";
import { useOptimizedIonRouter } from "../../helpers/useOptimizedIonRouter";
import { useBuildGeneralBrowseLink } from "../../helpers/routes";
import { orderBy, sample } from "lodash";
import { getHandle } from "../../helpers/lemmy";
import {
  TransitionOptions,
  createAnimation,
  iosTransitionAnimation,
  mdTransitionAnimation,
} from "@ionic/core";

const RANDOM_CHUNK = 20;

export default function useGetRandomCommunity() {
  const router = useOptimizedIonRouter();
  const buildGeneralBrowseLink = useBuildGeneralBrowseLink();

  return useCallback(async () => {
    const totalCommunitiesCount =
      store.getState().site.response?.site_view.counts.communities;
    if (!totalCommunitiesCount) return;

    const client = clientSelector(store.getState());

    const response = await client.listCommunities({
      type_: "All",
      limit: RANDOM_CHUNK,
      page: Math.floor((Math.random() * totalCommunitiesCount) / RANDOM_CHUNK),
    });

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

    if (!chosenRandomCommunity) return;

    router.push(
      buildGeneralBrowseLink(`/c/${getHandle(chosenRandomCommunity)}?random=1`),
      "forward",
      "replace",
      undefined,
      (baseEl: HTMLElement, opts: TransitionOptions) => {
        // Do not animate into view
        if (opts.direction === "forward") return createAnimation();

        // Later, use normal animation for swipe back
        return opts.mode === "ios"
          ? iosTransitionAnimation(baseEl, opts)
          : mdTransitionAnimation(baseEl, opts);
      },
    );

    return true;
  }, [buildGeneralBrowseLink, router]);
}
