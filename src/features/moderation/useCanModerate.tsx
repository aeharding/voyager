import { useMemo } from "react";
import { canModerate, getItemActorName } from "../../helpers/lemmy";
import { useAppSelector } from "../../store";
import useIsAdmin from "./useIsAdmin";
import { Community } from "lemmy-js-client";
import {
  shield,
  shieldCheckmark,
  shieldCheckmarkOutline,
  shieldOutline,
} from "ionicons/icons";

export type ModeratorRole = "mod" | "admin-local" | "admin-remote";

export default function useCanModerate(
  community: Community | undefined,
): ModeratorRole | undefined {
  const moderates = useAppSelector(
    (state) => state.auth.site?.my_user?.moderates,
  );
  const isAdmin = useIsAdmin();
  const myPerson = useAppSelector(
    (state) => state.auth.site?.my_user?.local_user_view?.person,
  );

  return useMemo(() => {
    if (canModerate(community?.id, moderates)) {
      return "mod";
    }

    // If user is admin on site of current community
    if (isAdmin && myPerson && community)
      return community.local ? "admin-local" : "admin-remote";
  }, [moderates, community, isAdmin, myPerson]);
}

export function getModColor(role: ModeratorRole): "danger" | "success" {
  switch (role) {
    case "admin-local":
    case "admin-remote":
      return "danger";
    case "mod":
      return "success";
  }
}

export function getModIcon(role: ModeratorRole, solid = false): string {
  switch (role) {
    case "admin-local":
    case "mod":
      return solid ? shieldCheckmark : shieldCheckmarkOutline;
    case "admin-remote":
      return solid ? shield : shieldOutline;
  }
}
