import { useMemo } from "react";
import { canModerate } from "../../helpers/lemmy";
import { useAppSelector } from "../../store";

export default function useCanModerate(communityId: number | undefined) {
  const moderates = useAppSelector(
    (state) => state.auth.site?.my_user?.moderates,
  );

  return useMemo(
    () => canModerate(communityId, moderates),
    [moderates, communityId],
  );
}
