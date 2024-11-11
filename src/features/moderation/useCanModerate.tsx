import {
  shieldCheckmark,
  shieldCheckmarkOutline,
  shieldOutline,
} from "ionicons/icons";
import { Community, CommunityModeratorView, Person } from "lemmy-js-client";

import {
  isAdminSelector,
  moderatesSelector,
  userPersonSelector,
} from "#/features/auth/siteSlice";
import { canModerateCommunity } from "#/helpers/lemmy";
import store, { useAppSelector } from "#/store";

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
  const moderates = useAppSelector(moderatesSelector);
  const isAdmin = useAppSelector(isAdminSelector);
  const myPerson = useAppSelector(userPersonSelector);

  return canModerateWith(community, isAdmin, myPerson, moderates);
}

/**
 * Use `useCanModerate` hook instead if you need to reactive updates
 *
 * This function is used in present() functions of action sheets,
 * since nothing is reactive (logic can be done right before presenting)
 */
export function getCanModerate(
  community: Community | boolean | undefined,
): ModeratorRole | undefined {
  const state = store.getState();

  const moderates = moderatesSelector(state);
  const isAdmin = isAdminSelector(state);
  const myPerson = userPersonSelector(state);

  return canModerateWith(community, isAdmin, myPerson, moderates);
}

function canModerateWith(
  community: Community | boolean | undefined,
  isAdmin: boolean | undefined,
  myPerson: Person | undefined,
  moderates: CommunityModeratorView[] | undefined,
) {
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
