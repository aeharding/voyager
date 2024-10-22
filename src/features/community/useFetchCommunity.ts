import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { getCommunity } from "../../features/community/communitySlice";

// fetches the community from local state, or from the server if it does not exist
// returns undefined until the value is available
export default function useFetchCommunity(communityHandle: string) {
  const dispatch = useAppDispatch();
  const community = useAppSelector(
    (state) => state.community.communityByHandle[communityHandle],
  );

  useEffect(() => {
    if (community) return;

    dispatch(getCommunity(communityHandle));
  }, [community, communityHandle, dispatch]);

  return community;
}
