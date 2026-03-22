import { useState } from "react";

import { getCommunity } from "#/features/community/communitySlice";
import { useAppDispatch, useAppSelector } from "#/store";

// fetches the community from local state, or from the server if it does not exist
// returns undefined until the value is available
export default function useFetchCommunity(communityHandle: string) {
  const dispatch = useAppDispatch();
  const community = useAppSelector(
    (state) => state.community.communityByHandle[communityHandle.toLowerCase()],
  );

  const [oldCommunityHandle, setOldCommunityHandle] = useState<
    typeof communityHandle | undefined
  >();
  const [oldCommunity, setOldCommunity] = useState<
    typeof community | undefined
  >(community);

  if (oldCommunityHandle !== communityHandle || oldCommunity !== community) {
    setOldCommunityHandle(communityHandle);
    setOldCommunity(community);

    if (!community) {
      dispatch(getCommunity(communityHandle));
    }
  }

  return community;
}
