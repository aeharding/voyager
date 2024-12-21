import { IonRefresher, IonRefresherContent } from "@ionic/react";
import { compact, uniqBy } from "es-toolkit";
import { CommunityFollowerView, CommunityView } from "lemmy-js-client";
import { useState } from "react";

import { getSite } from "#/features/auth/siteSlice";
import { isSafariFeedHackEnabled } from "#/routes/pages/shared/FeedContent";
import { useAppDispatch, useAppSelector } from "#/store";

import { CommunitiesListProps } from "./CommunitiesList";
import ResolvedCommunitiesList from "./ResolvedCommunitiesList";

export default function LoggedInCommunitiesList(props: CommunitiesListProps) {
  const dispatch = useAppDispatch();
  const follows = useAppSelector(
    (state) => state.site.response?.my_user?.follows,
  );
  const communityByHandle = useAppSelector(
    (state) => state.community.communityByHandle,
  );

  const [isListAtTop, setIsListAtTop] = useState(true);

  async function refresh() {
    await dispatch(getSite());
  }

  return (
    <>
      <IonRefresher
        slot="fixed"
        onIonRefresh={(e) => {
          refresh().finally(() => e.detail.complete());
        }}
        disabled={isSafariFeedHackEnabled && !isListAtTop}
      >
        <IonRefresherContent />
      </IonRefresher>

      <ResolvedCommunitiesList
        {...props}
        communities={buildCommunities(follows, communityByHandle)}
        onListAtTopChange={setIsListAtTop}
      />
    </>
  );
}

function buildCommunities(
  follows: CommunityFollowerView[] | undefined,
  communityByHandle: Record<string, CommunityView>,
) {
  const allCommunities = uniqBy(
    compact([
      ...(follows || []).map((f) => f.community),
      ...Object.values(communityByHandle).map((c) => c?.community),
    ]),
    (c) => c.id,
  );

  const unsubscribedCommunityIds = Object.values(communityByHandle)
    .filter((response) => response?.subscribed === "NotSubscribed")
    .map((c) => c?.community.id);

  return allCommunities.filter(
    (community) => !unsubscribedCommunityIds.includes(community.id),
  );
}
