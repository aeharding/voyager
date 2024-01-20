import { useMemo } from "react";
import { useAppSelector } from "../../../store";
import ResolvedCommunitiesList from "./ResolvedCommunitiesList";
import { compact, pullAllBy, uniqBy } from "lodash";
import { CommunitiesListProps } from "./CommunitiesList";

export default function LoggedInCommunitiesList(props: CommunitiesListProps) {
  const follows = useAppSelector(
    (state) => state.site.response?.my_user?.follows,
  );

  const communityByHandle = useAppSelector(
    (state) => state.community.communityByHandle,
  );

  const communities = useMemo(() => {
    const communities = uniqBy(
      compact([
        ...(follows || []).map((f) => f.community),
        ...Object.values(communityByHandle).map((c) => c?.community),
      ]),
      "id",
    );

    pullAllBy(
      communities,
      Object.values(communityByHandle)
        .filter((response) => response?.subscribed === "NotSubscribed")
        .map((c) => c?.community),
      "id",
    );

    return communities;
  }, [follows, communityByHandle]);

  return <ResolvedCommunitiesList {...props} communities={communities} />;
}
