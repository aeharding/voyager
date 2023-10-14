import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { getCommunity } from "../../features/community/communitySlice";

// fetches the community from local state, or from the server if it does not exist
// returns undefined until the value is available
export default function useFetchCommunity(communityHandle: string) {
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

  return community;
}
