import { ModlogItem } from "threadiverse";

/**
 * User-facing notification title for a mod-action received in the inbox.
 *
 * The modlog page renders the same action as a terse third-person record
 * ("Warned Comment", "Removed Post"), which suits mod review. In the inbox
 * we're notifying the *target*, so we phrase it as something the community
 * (or an admin) did to them: "FuckCars mods sent you a warning."
 *
 * `is_revert` flips the verb where it makes sense (remove → restore,
 * lock → unlock, ban → unban, add → remove).
 */
export function inboxModActionTitle(item: ModlogItem): string {
  const actor = item.target_community
    ? `${item.target_community.title || item.target_community.name} mods`
    : "An admin";
  const reverted = item.modlog.is_revert;

  switch (item.modlog.kind) {
    case "mod_warn_comment":
    case "mod_warn_post":
      return reverted
        ? `${actor} cleared a warning on your ${kindNoun(item.modlog.kind)}`
        : `${actor} sent you a warning`;

    case "mod_remove_comment":
    case "mod_remove_post":
    case "admin_remove_community":
      return reverted
        ? `${actor} restored your ${kindNoun(item.modlog.kind)}`
        : `${actor} removed your ${kindNoun(item.modlog.kind)}`;

    case "mod_lock_comment":
    case "mod_lock_post":
      return reverted
        ? `${actor} unlocked your ${kindNoun(item.modlog.kind)}`
        : `${actor} locked your ${kindNoun(item.modlog.kind)}`;

    case "mod_ban_from_community":
      return reverted
        ? `${actor} unbanned you from the community`
        : `${actor} banned you from the community`;

    case "admin_ban":
      return reverted
        ? "An admin unbanned you from the instance"
        : "An admin banned you from the instance";

    case "mod_add_to_community":
      return reverted
        ? `${actor} removed you as a moderator`
        : `${actor} added you as a moderator`;

    case "admin_add":
      return reverted
        ? "An admin removed you as an admin"
        : "An admin added you as an admin";

    case "mod_transfer_community":
      return `${actor} transferred the community to you`;

    case "mod_feature_post_community":
      return reverted
        ? `${actor} unfeatured your post`
        : `${actor} featured your post`;

    case "admin_feature_post_site":
      return reverted
        ? "An admin unfeatured your post"
        : "An admin featured your post site-wide";

    case "mod_change_community_visibility":
      return `${actor} changed community visibility`;

    case "admin_purge_comment":
    case "admin_purge_post":
    case "admin_purge_community":
    case "admin_purge_person":
      return `An admin purged ${purgeNoun(item.modlog.kind)}`;
  }
}

function kindNoun(
  kind:
    | "admin_remove_community"
    | "mod_lock_comment"
    | "mod_lock_post"
    | "mod_remove_comment"
    | "mod_remove_post"
    | "mod_warn_comment"
    | "mod_warn_post",
): string {
  if (kind.endsWith("_comment")) return "comment";
  if (kind === "admin_remove_community") return "community";
  return "post";
}

function purgeNoun(
  kind:
    | "admin_purge_comment"
    | "admin_purge_community"
    | "admin_purge_person"
    | "admin_purge_post",
): string {
  switch (kind) {
    case "admin_purge_comment":
      return "your comment";
    case "admin_purge_post":
      return "your post";
    case "admin_purge_community":
      return "your community";
    case "admin_purge_person":
      return "your account";
  }
}
