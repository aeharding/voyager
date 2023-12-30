import useSupported from "../../../helpers/useSupported";
import { useAppSelector } from "../../../store";

export default function useShowModeratorFeed() {
  const moderates = useAppSelector(
    (state) => state.site.response?.my_user?.moderates,
  );
  const moderatorFeedSupported = useSupported("Modded Feed");

  return !!moderates?.length && moderatorFeedSupported;
}
