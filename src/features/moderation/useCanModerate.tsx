import { useMemo } from "react";
import { canModerate } from "../../helpers/lemmy";
import { useAppSelector } from "../../store";
import useIsAdmin from "./useIsAdmin";

export default function useCanModerate(communityId: number | undefined) {
  const moderates = useAppSelector(
    (state) => state.auth.site?.my_user?.moderates,
  );
  const isAdmin = useIsAdmin();

  return useMemo(
    () => isAdmin || canModerate(communityId, moderates),
    [moderates, communityId, isAdmin],
  );
}
