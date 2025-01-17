import { useEffect } from "react";

import { getCommunity } from "#/features/community/communitySlice";
import { useAppDispatch, useAppSelector } from "#/store";

// fetches the community from local state, or from the server if it does not exist
// returns undefined until the value is available
export default function useFetchCommunity(communityHandle: string) {
  const dispatch = useAppDispatch();
  const community = useAppSelector(
    (state) => state.community.communityByHandle[communityHandle.toLowerCase()],
  );

  useEffect(() => {
    if (community) return;

    dispatch(getCommunity(communityHandle));
  }, [community, communityHandle, dispatch]);

  return community;
}
