import { useMemo } from "react";
import { canModerate as canModerateCommunity } from "../../helpers/lemmy";
import { useAppSelector } from "../../store";
import useIsAdmin from "./useIsAdmin";
import { Community } from "lemmy-js-client";
import {
  shieldCheckmark,
  shieldCheckmarkOutline,
  shieldOutline,
} from "ionicons/icons";

export type ModeratorRole = "mod" | "admin-local" | "admin-remote";

/**
 * @param community
 *   Either the community to check mod status for a specific community,
 *   or `true` to check account role (admin-local, mod or undefined)
 * @returns Role of moderator, if available
 */
export default function useCanModerate(
  community: Community | boolean | undefined,
): ModeratorRole | undefined {
  const moderates = useAppSelector(
    (state) => state.site.response?.my_user?.moderates,
  );
  const isAdmin = useIsAdmin();
  const myPerson = useAppSelector(
    (state) => state.site.response?.my_user?.local_user_view?.person,
  );

  return useMemo(() => {
    if (!community) return;

    // Check account role if true
    if (typeof community === "boolean") {
      if (isAdmin && myPerson) return "admin-local";
      if (moderates?.length) return "mod";

      return;
    }

    // else, check specific community role

    if (canModerateCommunity(community?.id, moderates)) {
      return "mod";
    }

    // If user is admin on site of current community
    if (isAdmin && myPerson)
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
      return shieldOutline;
  }
}

export function getModName(role: ModeratorRole): string {
  switch (role) {
    case "admin-local":
    case "admin-remote":
      return "Administrator";
    case "mod":
      return "Moderator";
  }
}
