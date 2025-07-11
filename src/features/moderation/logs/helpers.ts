import { ModlogItem } from "threadiverse";

export function getLogIndex(item: ModlogItem): string {
  switch (true) {
    case "mod_remove_comment" in item:
      return `mod_remove_comment-${item.mod_remove_comment.id}`;
    case "mod_remove_post" in item:
      return `mod_remove_post-${item.mod_remove_post.id}`;
    case "mod_lock_post" in item:
      return `mod_lock_post-${item.mod_lock_post.id}`;
    case "mod_feature_post" in item:
      return `mod_feature_post-${item.mod_feature_post.id}`;
    case "mod_remove_community" in item:
      return `mod_remove_community-${item.mod_remove_community.id}`;
    case "mod_ban_from_community" in item:
      return `mod_ban_from_community-${item.mod_ban_from_community.id}`;
    case "mod_ban" in item:
      return `mod_ban-${item.mod_ban.id}`;
    case "mod_add_community" in item:
      return `mod_add_community-${item.mod_add_community.id}`;
    case "mod_transfer_community" in item:
      return `mod_transfer_community-${item.mod_transfer_community.id}`;
    case "mod_add" in item:
      return `mod_add-${item.mod_add.id}`;
    case "admin_purge_person" in item:
      return `admin_purge_person-${item.admin_purge_person.id}`;
    case "admin_purge_community" in item:
      return `admin_purge_community-${item.admin_purge_community.id}`;
    case "admin_purge_post" in item:
      return `admin_purge_post-${item.admin_purge_post.id}`;
    case "admin_purge_comment" in item:
      return `admin_purge_comment-${item.admin_purge_comment.id}`;
    case "mod_hide_community" in item:
      return `mod_hide_community-${item.mod_hide_community.id}`;
    default:
      // should never happen (type = never)
      //
      // If item is not type = never, then some mod log action was added
      // and needs to be handled.
      return item;
  }
}
