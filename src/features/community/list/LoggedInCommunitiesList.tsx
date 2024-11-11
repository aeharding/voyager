import { compact, uniqBy } from "es-toolkit";
import { CommunityFollowerView, CommunityView } from "lemmy-js-client";

import { useAppSelector } from "#/store";

import { CommunitiesListProps } from "./CommunitiesList";
import ResolvedCommunitiesList from "./ResolvedCommunitiesList";

export default function LoggedInCommunitiesList(props: CommunitiesListProps) {
  const follows = useAppSelector(
    (state) => state.site.response?.my_user?.follows,
  );

  const communityByHandle = useAppSelector(
    (state) => state.community.communityByHandle,
  );

  return (
    <ResolvedCommunitiesList
      {...props}
      communities={buildCommunities(follows, communityByHandle)}
    />
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
