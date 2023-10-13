import { useAppDispatch, useAppSelector } from "../../store";
import { useEffect } from "react";
import { getCommunity } from "./communitySlice";
import useCommunityActions from "./useCommunityActions";

// fetches the community info (subscribed, etc) from the server if its not available in local
export default function useCommunity(communityHandle: string) {
  const dispatch = useAppDispatch();

  const communityByHandle = useAppSelector(
    (state) => state.community.communityByHandle,
  );

  useEffect(() => {
    if (communityByHandle[communityHandle]) return;

    dispatch(getCommunity(communityHandle));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityHandle]);

  const community = communityByHandle[communityHandle];

  if (!community) {
    return {
      community,
    };
  }

  const {
    isFavorite,
    isSubscribed,
    isBlocked,
    subscribe,
    favorite,
    block,
    sidebar,
    view,
  } = useCommunityActions(community);

  return {
    community,
    communityByHandle,
    isSubscribed,
    isFavorite,
    isBlocked,
    subscribe,
    favorite,
    sidebar,
    view,
    block,
  };
}
